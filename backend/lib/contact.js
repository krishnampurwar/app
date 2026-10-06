/** Compulsory contact validation — mirrors the old Pydantic ContactRequired mixin. */

export function validateContact(body) {
  const name = String(body?.name ?? "").trim();
  const phone = String(body?.phone ?? "").trim();
  const digits = phone.replace(/\D/g, "");
  const errors = [];
  if (name.length < 2) errors.push({ field: "name", message: "Please enter your name" });
  if (digits.length < 10 || digits.length > 13) {
    errors.push({ field: "phone", message: "Please enter a valid phone number (at least 10 digits)" });
  }
  return { name, phone, errors };
}

/** Express guard: 422 with field errors before any AI call is made. */
export function requireContact(req, res, next) {
  const { name, phone, errors } = validateContact(req.body);
  if (errors.length) {
    res.status(422).json({ detail: errors });
    return;
  }
  req.contact = { name, phone };
  next();
}
