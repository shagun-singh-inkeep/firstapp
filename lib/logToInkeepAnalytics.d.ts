/**
 * Normalizes and logs a conversation to Inkeep Analytics.
 * Reads the webIntegrationKey from the INKEEP_ANALYTICS_KEY env var.
 * @param payload - the raw conversation payload
 */
export declare function logToInkeepAnalytics(payload: any): Promise<void>;
