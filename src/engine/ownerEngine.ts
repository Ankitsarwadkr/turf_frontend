import { api } from "../shared/api"

export const getMyTurfs = () =>
  api.get("/owners/turfs/me")

export const getTurfById=(id:number)=>
  api.get(`/owners/turfs/me/${id}`)

export const addTurf = (fd:FormData) =>
  api.post("/owners/turfs/addTurf", fd)

export const updateTurf = (id:number,data:any)=>
  api.put(`/owners/turfs/update/${id}`,data)

export const addTurfImages = (turfId: number, files: File[]) => {
  const fd = new FormData()
  files.forEach(f => fd.append("images", f))
  return api.post(`/owners/turfs/${turfId}/images`, fd)
}

export const deleteTurfImage = (turfId: number, imageId: number) =>
  api.delete(`/owners/turfs/${turfId}/images/${imageId}`)

export const deleteTurf=(id:number)=>
  api.delete(`/owners/turfs/delete/${id}`)

export const saveTurfSchedule = (id:number,data:any) =>
  api.post(`/owners/turfs/${id}/schedule`, data)

export const generateSlots = (id:number) =>
  api.post(`/owners/turfs/slots/generate/${id}`)

export const getSlots = (id:number,date:string) =>
  api.get(`/owners/turfs/slots`, { params:{ turfId:id, date }})

export const updateSlotStatus = (id:number,data:any) =>
  api.patch(`/owners/turfs/slots/status/${id}`, data)

export const getTurfSchedule = (id: number) =>
  api.get(`/owners/turfs/${id}/schedule`)

export const getOwnerBookings = () =>
  api.get("/owner/bookings")

export const getOwnerBookingDetails = (bookingId: string) =>
  api.get(`/owner/bookings/${bookingId}`)
export const getOwnerBalance = () => api.get("/owner/ledger/balance")

export const getNextPayout = () => api.get("/owner/ledger/pending")

export const getPaymentHistory = () => api.get("/owner/ledger/history")

export const getWeeklyLedger = (start: string, end: string) =>
  api.get("/owner/ledger/weekly-ledger", { params: { start, end } })



export interface OwnerBalanceResponse {
  balance: number
}

export interface OwnerNextPayoutRow {
  bookingId: string
  amount: number
  earnedAt: string
  reason: string
}

export interface OwnerPaidHistoryRow {
  amount: number
  paidAt: string
  reference: string
}

export interface OwnerLedgerRow {
  date: string
  bookingId: string
  type: string
  reason: string
  amount: number
  reference: string
}

export interface OwnerWeeklyLedgerResponse {
  statementId: string
  ownerName: string
  ownerId: number
  weekStart: string
  weekEnd: string
  openingBalance: number
  closingBalance: number
  rows: OwnerLedgerRow[]  // Changed from 'ledger' to 'rows'
}