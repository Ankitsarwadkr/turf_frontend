import { api } from "../shared/api";
export const fetchPendingOwners = () => api.get("/admin/owners/pending");
export const approveOwner = (id) => api.put(`/admin/owners/${id}/approve`);
export const rejectOwner = (id, reason) => api.put(`/admin/owners/${id}/reject`, { reason });
// Add to adminEngine.ts
export const getPayoutBatches = () => api.get("/admin/payouts/batches");
export const getBatchDetails = (batchId) => api.get(`/admin/payouts/batches/${batchId}`);
export const approveBatch = (batchId) => api.post(`/admin/payouts/batches/${batchId}/approve`);
export const getBatchExecutions = (batchId) => api.get(`/admin/payouts/batches/${batchId}/executions`);
export const getExecutionDetails = (executionId) => api.get(`/admin/payouts/executions/${executionId}`);
export const markExecutionPaid = (executionId, paymentReference) => api.post(`/admin/payouts/executions/${executionId}/paid`, { paymentReference });
export const markExecutionFailed = (executionId, failureCode, failureReason) => api.post(`/admin/payouts/executions/${executionId}/failed`, { failureCode, failureReason });
export const retryExecution = (executionId, note) => api.post(`/admin/payouts/executions/${executionId}/retry`, { note });
