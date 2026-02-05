import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getTurfSchedule, saveTurfSchedule } from "../../engine/ownerEngine";
import { useToastStore } from "../../store/toastStore";
import { ChevronLeft } from "lucide-react";
const normalize = (t) => t?.slice(0, 5) || "";
const formatTime = (t) => t ? new Date(`1970-01-01T${t}`).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
}) : "";
const timeToMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};
export default function TurfSchedule() {
    const { turfId } = useParams();
    const nav = useNavigate();
    const toast = useToastStore(s => s.push);
    const [openTime, setOpenTime] = useState("");
    const [closeTime, setCloseTime] = useState("");
    const [slotDuration, setSlotDuration] = useState("");
    const [priceSlots, setPriceSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
    useEffect(() => {
        if (!turfId)
            return;
        setFetching(true);
        getTurfSchedule(Number(turfId))
            .then(r => {
            if (r.data) {
                setHasExistingSchedule(true);
                setOpenTime(normalize(r.data.openTime));
                setCloseTime(normalize(r.data.closeTime));
                setSlotDuration(r.data.slotDurationMinutes);
                setPriceSlots((r.data.priceSlots || []).map((p) => ({
                    startTime: normalize(p.startTime),
                    endTime: normalize(p.endTime),
                    pricePerSlot: p.pricePerSlot
                })));
            }
        })
            .catch(() => {
            // Schedule doesn't exist yet - this is fine
            setHasExistingSchedule(false);
        })
            .finally(() => setFetching(false));
    }, [turfId]);
    const addPriceSlot = () => {
        const lastSlot = priceSlots[priceSlots.length - 1];
        const newStart = lastSlot ? lastSlot.endTime : openTime || "";
        setPriceSlots(p => [...p, {
                startTime: newStart,
                endTime: "",
                pricePerSlot: 0
            }]);
    };
    const removePriceSlot = (i) => {
        if (priceSlots.length <= 1) {
            toast("error", "At least one pricing period is required");
            return;
        }
        setPriceSlots(p => p.filter((_, ix) => ix !== i));
    };
    const updatePriceSlot = (index, field, value) => {
        setPriceSlots(slots => slots.map((slot, i) => i === index ? { ...slot, [field]: value } : slot));
    };
    const validateSchedule = () => {
        // Basic field validation
        if (!openTime || !closeTime || !slotDuration) {
            return "Please complete all operating hours and slot duration fields";
        }
        if (priceSlots.length === 0) {
            return "At least one pricing period is required";
        }
        // Validate all price slots
        for (let i = 0; i < priceSlots.length; i++) {
            const slot = priceSlots[i];
            if (!slot.startTime || !slot.endTime) {
                return `Pricing period ${i + 1}: Start and end times are required`;
            }
            if (slot.pricePerSlot <= 0) {
                return `Pricing period ${i + 1}: Price must be greater than 0`;
            }
            // Check if end time is after start time (accounting for next day)
            const startMins = timeToMinutes(slot.startTime);
            const endMins = timeToMinutes(slot.endTime);
            // If closeTime < openTime, turf operates past midnight
            const closesMins = timeToMinutes(closeTime);
            const opensMins = timeToMinutes(openTime);
            const crossesMidnight = closesMins < opensMins;
            if (!crossesMidnight && endMins <= startMins) {
                return `Pricing period ${i + 1}: End time must be after start time`;
            }
        }
        // Check for gaps or overlaps
        const sortedSlots = [...priceSlots].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        for (let i = 0; i < sortedSlots.length - 1; i++) {
            const current = sortedSlots[i];
            const next = sortedSlots[i + 1];
            if (current.endTime !== next.startTime) {
                return "Pricing periods must be continuous with no gaps or overlaps";
            }
        }
        // Validate coverage (first slot should start at openTime, last should end at closeTime)
        if (sortedSlots[0].startTime !== openTime) {
            return "First pricing period must start at opening time";
        }
        if (sortedSlots[sortedSlots.length - 1].endTime !== closeTime) {
            return "Last pricing period must end at closing time";
        }
        return null;
    };
    const handleSave = async () => {
        const validationError = validateSchedule();
        if (validationError) {
            toast("error", validationError);
            return;
        }
        if (!turfId)
            return;
        setLoading(true);
        try {
            const response = await saveTurfSchedule(Number(turfId), {
                openTime,
                closeTime,
                slotDurationMinutes: slotDuration,
                priceSlots
            });
            const successMessage = response.data?.message || "Turf schedule saved successfully";
            toast("success", successMessage);
            setHasExistingSchedule(true);
        }
        catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.response?.status === 400
                ? "Invalid schedule configuration. Please check all fields"
                : error.response?.status === 403
                    ? "You don't have permission to update this turf"
                    : error.response?.status === 404
                        ? "Turf not found"
                        : "Failed to save schedule";
            toast("error", errorMessage);
        }
        finally {
            setLoading(false);
        }
    };
    if (fetching) {
        return (_jsxs("div", { className: "space-y-0", children: [_jsx("div", { className: "bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static", children: _jsxs("div", { className: "w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center gap-3", children: [_jsx("button", { onClick: () => nav(-1), className: "p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95", children: _jsx(ChevronLeft, { size: 20, className: "text-text-primary" }) }), _jsx("h1", { className: "text-page-title font-semibold text-text-primary", children: "Turf Schedule" })] }) }), _jsx("div", { className: "w-full max-w-7xl mx-auto p-6", children: _jsx("div", { className: "text-center py-12 text-text-secondary text-sm font-medium", children: "Loading schedule..." }) })] }));
    }
    return (_jsxs("div", { className: "space-y-0", children: [_jsx("div", { className: "bg-neutral-surface border-b border-neutral-border lg:border-t-0 border-t sticky top-0 z-20 lg:static", children: _jsxs("div", { className: "w-full max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center gap-3", children: [_jsx("button", { onClick: () => nav(-1), className: "p-2 -ml-2 rounded-xl hover:bg-neutral-hover transition-all duration-200 active:scale-95", children: _jsx(ChevronLeft, { size: 20, className: "text-text-primary" }) }), _jsx("h1", { className: "text-page-title font-semibold text-text-primary", children: "Turf Schedule" })] }) }), _jsx("div", { className: "w-full max-w-7xl mx-auto p-4 lg:p-6", children: _jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-text-primary", children: "Configure Operating Hours & Pricing" }), _jsx("p", { className: "text-sm text-text-secondary font-medium mt-1", children: "Set your turf's schedule and define pricing periods for different times" })] }), _jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl p-6 space-y-5 shadow-card", children: [_jsx("h3", { className: "text-sm font-semibold tracking-tight text-text-primary", children: "Operating Hours" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-text-secondary mb-3", children: ["Opening Time", openTime && (_jsxs("span", { className: "ml-2 text-text-muted font-normal", children: ["(", formatTime(openTime), ")"] }))] }), _jsx("input", { type: "time", value: openTime, onChange: e => setOpenTime(e.target.value), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-text-secondary mb-3", children: ["Closing Time", closeTime && (_jsxs("span", { className: "ml-2 text-text-muted font-normal", children: ["(", formatTime(closeTime), ")"] }))] }), _jsx("input", { type: "time", value: closeTime, onChange: e => setCloseTime(e.target.value), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" }), _jsx("p", { className: "text-xs text-text-muted mt-2 font-medium", children: "If closing time is before opening time, turf operates past midnight" })] })] })] }), _jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl p-6 shadow-card", children: [_jsx("h3", { className: "text-sm font-semibold tracking-tight text-text-primary mb-4", children: "Slot Duration" }), _jsxs("select", { value: slotDuration, onChange: e => setSlotDuration(+e.target.value), className: "w-full md:w-1/2 border border-neutral-border bg-neutral-surface text-text-primary px-5 py-3 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200", children: [_jsx("option", { value: "", children: "Select duration" }), _jsx("option", { value: "60", children: "60 minutes (1 hour)" }), _jsx("option", { value: "90", children: "90 minutes (1.5 hours)" }), _jsx("option", { value: "120", children: "120 minutes (2 hours)" })] }), _jsx("p", { className: "text-xs text-text-muted mt-3 font-medium", children: "This determines how long each bookable time slot will be" })] }), _jsxs("div", { className: "bg-neutral-surface border border-neutral-border rounded-2xl p-6 space-y-5 shadow-card", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold tracking-tight text-text-primary", children: "Pricing Periods" }), _jsx("p", { className: "text-sm text-text-secondary font-medium mt-1", children: "Define different prices for different times of the day" })] }), _jsx("button", { onClick: addPriceSlot, className: "px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all duration-200 font-semibold text-sm active:scale-[0.98] shadow-subtle", children: "+ Add Period" })] }), priceSlots.length === 0 && (_jsx("div", { className: "text-center py-8 text-text-muted bg-neutral-bg rounded-xl border-2 border-dashed border-neutral-border animate-fadeIn", children: "No pricing periods defined. Click \"Add Period\" to get started." })), _jsx("div", { className: "space-y-4", children: priceSlots.map((slot, i) => (_jsxs("div", { className: "bg-neutral-bg border border-neutral-border rounded-xl p-5 animate-scaleIn", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("span", { className: "font-semibold text-text-primary text-sm", children: ["Period ", i + 1] }), _jsx("button", { onClick: () => removePriceSlot(i), className: "text-danger hover:text-red-700 text-sm font-semibold transition-colors duration-200 active:scale-95", children: "Remove" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-text-secondary mb-3", children: ["Start Time", slot.startTime && (_jsxs("span", { className: "ml-2 text-text-muted font-normal", children: ["(", formatTime(slot.startTime), ")"] }))] }), _jsx("input", { type: "time", value: slot.startTime, onChange: e => updatePriceSlot(i, "startTime", e.target.value), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-text-secondary mb-3", children: ["End Time", slot.endTime && (_jsxs("span", { className: "ml-2 text-text-muted font-normal", children: ["(", formatTime(slot.endTime), ")"] }))] }), _jsx("input", { type: "time", value: slot.endTime, onChange: e => updatePriceSlot(i, "endTime", e.target.value), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text-secondary mb-3", children: "Price (\u20B9)" }), _jsx("input", { type: "number", min: "0", step: "50", value: slot.pricePerSlot || "", onChange: e => updatePriceSlot(i, "pricePerSlot", +e.target.value), className: "w-full border border-neutral-border bg-neutral-surface text-text-primary px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200", placeholder: "0" })] })] })] }, i))) })] }), _jsxs("div", { className: "flex items-center justify-between bg-neutral-surface border border-neutral-border rounded-2xl p-5 shadow-card", children: [_jsx("div", { className: "text-sm text-text-secondary font-medium", children: hasExistingSchedule ? (_jsx("span", { className: "text-success font-semibold", children: "\u2713 Schedule configured" })) : (_jsx("span", { children: "Configure schedule to enable slot generation" })) }), _jsx("button", { onClick: handleSave, disabled: loading, className: "px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold active:scale-[0.98] shadow-subtle", children: loading ? "Saving..." : hasExistingSchedule ? "Update Schedule" : "Save Schedule" })] })] }) })] }));
}
