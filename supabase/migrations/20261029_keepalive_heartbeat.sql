-- ==============================================================================
-- 防休眠保活配置 (Supabase Keepalive Heartbeat Setup)
-- 目的：建立專屬的心跳紀錄表，透過定時寫入 (INSERT/UPSERT) 產生真正的 Postgres 寫入事務，
--      保證穿透 API 閘道，杜絕 Supabase 7 天無活動休眠。
-- ==============================================================================

-- 1. 建立心跳紀錄表 (單一固定 ID，避免資料表膨脹)
CREATE TABLE IF NOT EXISTS public._keepalive (
    id TEXT PRIMARY KEY DEFAULT 'heartbeat',
    last_ping TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ping_count BIGINT NOT NULL DEFAULT 1
);

-- 2. 插入初始紀錄
INSERT INTO public._keepalive (id, last_ping, ping_count)
VALUES ('heartbeat', NOW(), 1)
ON CONFLICT (id) DO NOTHING;

-- 3. 啟用 RLS
ALTER TABLE public._keepalive ENABLE ROW LEVEL SECURITY;

-- 4. 建立公開讀取與更新權限原則 (允許 anon key 讀寫心跳表記錄)
DROP POLICY IF EXISTS "Allow anon read keepalive" ON public._keepalive;
CREATE POLICY "Allow anon read keepalive"
    ON public._keepalive FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow anon update keepalive" ON public._keepalive;
CREATE POLICY "Allow anon update keepalive"
    ON public._keepalive FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. 建立專屬的心跳 RPC 預存程序 (可透過 POST /rest/v1/rpc/ping_heartbeat 呼叫)
CREATE OR REPLACE FUNCTION public.ping_heartbeat()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    INSERT INTO public._keepalive (id, last_ping, ping_count)
    VALUES ('heartbeat', NOW(), 1)
    ON CONFLICT (id) DO UPDATE
    SET last_ping = NOW(),
        ping_count = public._keepalive.ping_count + 1
    RETURNING to_jsonb(public._keepalive.*) INTO result;
    
    RETURN result;
END;
$$;

-- 6. 授權 anon 角色執行此函式
GRANT EXECUTE ON FUNCTION public.ping_heartbeat() TO anon, authenticated;
