import { api } from "../shared/api"

export const fetchPendingOwners = () =>
  api.get("/admin/owners/pending")

export const approveOwner = (id:number) =>
  api.put(`/admin/owners/${id}/approve`)

export const rejectOwner = (id:number, reason:string) =>
  api.put(`/admin/owners/${id}/reject`, { reason })


// Add to adminEngine.ts
export const getPayoutBatches = () =>
  api.get("/admin/payouts/batches")

export const getBatchDetails = (batchId: number) =>
  api.get(`/admin/payouts/batches/${batchId}`)

export const approveBatch = (batchId: number) =>
  api.post(`/admin/payouts/batches/${batchId}/approve`)

export const getBatchExecutions = (batchId: number) =>
  api.get(`/admin/payouts/batches/${batchId}/executions`)

export const getExecutionDetails = (executionId: number) =>
  api.get(`/admin/payouts/executions/${executionId}`)

export const markExecutionPaid = (executionId: number, paymentReference: string) =>
  api.post(`/admin/payouts/executions/${executionId}/paid`, { paymentReference })

export const markExecutionFailed = (executionId: number, failureCode: string, failureReason: string) =>
  api.post(`/admin/payouts/executions/${executionId}/failed`, { failureCode, failureReason })

export const retryExecution = (executionId: number, note: string) =>
  api.post(`/admin/payouts/executions/${executionId}/retry`, { note })