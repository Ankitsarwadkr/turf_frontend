export function validateLogin(f) {
    const e = {};
    if (!f.email.trim())
        e.email = "Email is required";
    else if (!f.email.includes("@"))
        e.email = "Invalid email address";
    if (!f.password.trim())
        e.password = "Password is required";
    else if (f.password.length < 6)
        e.password = "Password must be at least 6 characters";
    return Object.keys(e).length ? e : null;
}
export function validateRegisterOwner(f) {
    const e = {};
    if (!f.name?.trim())
        e.name = "Name is required";
    if (!f.email?.trim())
        e.email = "Email is required";
    else if (!f.email.includes("@"))
        e.email = "Invalid email";
    if (!f.password || f.password.length < 6)
        e.password = "Password must be at least 6 characters";
    if (!/^[6-9]\d{9}$/.test(f.mobileNo))
        e.mobileNo = "Enter valid 10-digit mobile number";
    if (!f.subscriptionAmount || f.subscriptionAmount <= 0)
        e.subscriptionAmount = "Invalid subscription amount";
    if (!f.docType)
        e.docType = "Select document type";
    if (!f.document)
        e.document = "Verification document required";
    return Object.keys(e).length ? e : null;
}
export function validateRegisterCustomer(f) {
    const e = {};
    if (!f.name.trim())
        e.name = "Name is required";
    if (!f.email.trim())
        e.email = "Email is required";
    else if (!f.email.includes("@"))
        e.email = "Invalid email";
    if (!f.password || f.password.length < 6)
        e.password = "Password must be at least 6 characters";
    if (!/^[6-9]\d{9}$/.test(f.mobileNo))
        e.mobileNo = "Enter valid 10-digit mobile number";
    return Object.keys(e).length ? e : null;
}
export function validateTurfForm(f) {
    const e = {};
    if (!f.name.trim())
        e.name = "Turf name required";
    if (!f.address.trim())
        e.address = "Address required";
    if (!f.locality.trim())
        e.locality = "Locality required";
    if (!f.mapUrl.trim())
        e.mapUrl = "Google Map link required";
    if (!f.city.trim())
        e.city = "City required";
    if (!f.turfType.trim())
        e.turfType = "Turf type required";
    if (f.images.length === 0)
        e.images = "At least one image required";
    if (f.images.length > 6)
        e.images = "Maximum 6 images allowed";
    for (const img of f.images) {
        if (img.size > 2 * 1024 * 1024) {
            e.images = "Each image must be below 2MB";
            break;
        }
    }
    return e;
}
