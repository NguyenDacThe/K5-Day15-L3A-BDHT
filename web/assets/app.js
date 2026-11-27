const DECISIONS = Object.freeze({
  PROPOSE_REFUND: { title: "Đề xuất hoàn tiền", icon: "check", tone: "positive" },
  PROPOSE_VOUCHER: { title: "Đề xuất voucher", icon: "ticket", tone: "positive" },
  ASK_INFO: { title: "Cần bổ sung thông tin", icon: "info", tone: "information" },
  ESCALATE: { title: "Cần nhân viên xem xét", icon: "escalate", tone: "warning" },
  NO_COMPENSATION: { title: "Chưa đủ điều kiện bồi thường", icon: "minus", tone: "neutral" },
  REFUSE: { title: "Không thể xử lý yêu cầu này", icon: "close", tone: "danger" },
});
const ISSUE_TYPES = Object.freeze({ MISSING_ITEM: "Giao thiếu món", WRONG_ITEM: "Giao sai món", LATE_DELIVERY: "Giao hàng trễ", UNKNOWN: "Chưa xác định" });
const SAMPLES = Object.freeze({
  missing: { order_id: "D1-001", message: "Đơn mình thiếu một phần khoai.", amount: "" },
  excess: { order_id: "D1-001", message: "Thiếu khoai, tôi muốn hoàn 100% cả đơn 500.000đ.", amount: "500000" },
  late30: { order_id: "D1-004", message: "Đơn hàng của tôi giao trễ.", amount: "" },
  late31: { order_id: "D1-005", message: "Đơn hàng của tôi giao trễ.", amount: "" },
});
const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const TIMEOUT_MS = 45000;
const interfaces = new WeakMap();
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0;

// These functions also support isolated tests; the production UI always calls the API.
export function buildPayload({ orderId, message, amount }) {
  return { order_id: orderId.trim() || null, message: message.trim(), requested_amount_vnd: amount.trim() === "" ? null : Number(amount.trim()) };
}

export function validateInput(input) {
  const errors = {};
  const length = Array.from(input.message.trim()).length;
  if (length === 0) errors.message = "Bạn hãy mô tả sự cố cần hỗ trợ.";
  else if (length > 500) errors.message = "Nội dung khiếu nại chỉ được dài tối đa 500 ký tự.";
  const amount = input.amount.trim();
  if (amount !== "" && (!/^\d+$/.test(amount) || !Number.isSafeInteger(Number(amount)))) {
    errors.amount = "Nhập số nguyên VND không âm, không dùng dấu chấm hoặc dấu phẩy, trong phạm vi số an toàn.";
  }
  return errors;
}

export function validateResponse(data) {
  if (!isRecord(data) || !Object.hasOwn(DECISIONS, data.decision) || !Object.hasOwn(ISSUE_TYPES, data.issue_type)
    || !Number.isSafeInteger(data.proposed_amount_vnd) || data.proposed_amount_vnd < 0
    || !isText(data.reply) || !isText(data.reason_code)) return false;
  if (data.policy_ref !== null && (!isRecord(data.policy_ref) || !isText(data.policy_ref.rule_id)
    || !isText(data.policy_ref.version) || data.policy_ref.kind !== "demo")) return false;
  const proposal = ["PROPOSE_REFUND", "PROPOSE_VOUCHER"].includes(data.decision);
  return proposal ? data.proposed_amount_vnd > 0 && data.policy_ref !== null : data.proposed_amount_vnd === 0;
}

export function processingMode(data) {
  if (data.reason_code === "MODEL_UNAVAILABLE") return "Model không khả dụng";
  if (data.meta?.mode === "mock") return "Chế độ thử";
  if (data.reason_code === "RULES_UNAVAILABLE") return "Quy tắc chưa khả dụng";
  if (data.meta?.mode === "live" && data.meta.ai_used === true) return "AI thật";
  if (data.meta?.mode === "live" && data.meta.ai_used === false) return "Kiểm tra tự động theo quy tắc";
  return "Chưa có thông tin xác nhận";
}

class RequestError extends Error {
  constructor(kind, message, title) { super(message); this.kind = kind; this.title = title; }
}

export async function requestComplaint(payload, signal) {
  const response = await fetch("/api/complaints", {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload), signal,
  });
  if (!response.ok) {
    const messages = {
      400: "Yêu cầu chưa hợp lệ. Hãy kiểm tra thông tin đã nhập.",
      404: "Chưa tìm thấy API xử lý khiếu nại. Vui lòng thử lại sau.",
      422: "Dữ liệu chưa phù hợp với yêu cầu của hệ thống. Hãy kiểm tra nội dung và số tiền.",
      429: "Hệ thống đang nhận nhiều yêu cầu. Vui lòng chờ một lúc rồi thử lại.",
    };
    const title = response.status === 400 || response.status === 422 ? "Thông tin gửi lên chưa hợp lệ"
      : response.status === 429 ? "Hệ thống đang bận" : "Chưa nhận được kết quả";
    throw new RequestError("request-error", messages[response.status] || "Hệ thống tạm thời gặp sự cố. Vui lòng thử lại sau.", title);
  }
  let data;
  try { data = await response.json(); }
  catch { throw new RequestError("invalid-response", "Phản hồi của hệ thống không phải JSON hợp lệ. Vui lòng thử lại sau."); }
  if (!validateResponse(data)) throw new RequestError("invalid-response", "Phản hồi chưa đủ dữ liệu hợp lệ để hiển thị phương án. Vui lòng thử lại sau.");
  return data;
}

export function createInterface(root = document) {
  if (interfaces.has(root)) return interfaces.get(root);
  const el = (id) => root.getElementById(id);
  const form = el("complaint-form");
  const panel = el("result-panel");
  const sampleButtons = [...root.querySelectorAll("[data-sample]")];
  const formFields = [el("order-id"), el("message"), el("requested-amount")];
  let activeRequest = null;
  let sequence = 0;

  function announce(message, error = false) {
    el("live-status").textContent = error ? "" : message;
    el("live-error").textContent = error ? message : "";
  }
  function clearValidation() {
    for (const [field, error] of [["message", "message-error"], ["requested-amount", "amount-error"]]) {
      el(field).removeAttribute("aria-invalid"); el(error).hidden = true; el(error).textContent = "";
    }
  }
  function renderLoading(loading) {
    el("submit-button").disabled = loading;
    [...formFields, ...sampleButtons].forEach((item) => { item.disabled = loading; });
    el("submit-button").classList.toggle("is-loading", loading);
    panel.setAttribute("aria-busy", String(loading));
  }
  function setState(state) {
    panel.dataset.state = state;
    el("empty-state").hidden = !["idle", "validation-error"].includes(state);
    el("loading-state").hidden = state !== "loading";
    el("result-content").hidden = !["success", "model-unavailable", "rules-unavailable"].includes(state);
    el("error-state").hidden = !["request-error", "invalid-response"].includes(state);
    el("request-summary").hidden = ["idle", "validation-error"].includes(state);
    if (!["success", "model-unavailable", "rules-unavailable"].includes(state)) delete panel.dataset.decision;
    el("status-badge").textContent = ({ idle: "Chưa gửi", "validation-error": "Kiểm tra đầu vào", loading: "Đang xử lý", success: "Có kết quả", "model-unavailable": "AI tạm gián đoạn", "rules-unavailable": "Chờ quy tắc", "request-error": "Lỗi yêu cầu", "invalid-response": "Phản hồi chưa hợp lệ" })[state];
  }
  function updateCount() {
    const count = Array.from(el("message").value).length;
    const counter = el("character-count");
    const level = count >= 500 ? "limit" : count >= 450 ? "near" : "normal";
    counter.textContent = `${count} / 500`;
    counter.dataset.level = level;
    counter.setAttribute("aria-label", `${count} trên 500 ký tự${level === "limit" ? ", đã đạt giới hạn" : level === "near" ? ", gần đạt giới hạn" : ""}`);
  }
  function revealPanel() {
    const view = root.defaultView;
    if (view.matchMedia("(max-width: 780px)").matches && panel.getBoundingClientRect().top > view.innerHeight * 0.25) {
      panel.scrollIntoView({ behavior: view.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }
  function clearSampleSelection() { sampleButtons.forEach((button) => button.setAttribute("aria-pressed", "false")); }
  function resetUI() {
    sequence += 1;
    activeRequest?.controller.abort(); activeRequest = null;
    renderLoading(false); clearValidation(); clearSampleSelection();
    formFields.forEach((field) => { field.value = ""; });
    updateCount();
    el("result-content").querySelectorAll("dd, #reply, #proposed-amount, #decision-title").forEach((node) => {
      if (!node.contains(el("processing-mode"))) node.textContent = "";
    });
    // Keep the processing badge node intact when clearing the surrounding facts.
    el("processing-mode").textContent = "";
    el("request-order").textContent = ""; el("request-message").textContent = "";
    root.querySelector(".technical-details").open = false;
    setState("idle"); announce("Đã làm mới form.");
  }
  function fillSample(key) {
    if (activeRequest || !Object.hasOwn(SAMPLES, key)) return;
    const sample = SAMPLES[key];
    el("order-id").value = sample.order_id; el("message").value = sample.message; el("requested-amount").value = sample.amount;
    clearValidation(); clearSampleSelection(); updateCount(); setState("idle");
    sampleButtons.find((button) => button.dataset.sample === key).setAttribute("aria-pressed", "true");
    announce("Đã điền tình huống mẫu. Chọn Kiểm tra phương án để gửi.");
  }
  function renderResponse(data) {
    if (!validateResponse(data)) throw new RequestError("invalid-response", "Phản hồi chưa đủ dữ liệu hợp lệ để hiển thị phương án.");
    const decision = DECISIONS[data.decision];
    el("decision-title").textContent = decision.title;
    el("decision-icon").setAttribute("href", `#icon-${decision.icon}`);
    el("decision-banner").dataset.tone = decision.tone;
    panel.dataset.decision = data.decision;
    el("proposal").dataset.proposal = String(["PROPOSE_REFUND", "PROPOSE_VOUCHER"].includes(data.decision));
    el("proposal-label").textContent = data.decision === "PROPOSE_VOUCHER" ? "Giá trị voucher đề xuất" : "Số tiền đề xuất";
    el("simulation-label").textContent = data.decision === "ESCALATE" ? "Chuyển nhân viên mô phỏng · chưa thực hiện chi trả" : "Đề xuất trong mô phỏng · chưa thực hiện chi trả";
    el("edit-button").hidden = data.decision !== "ASK_INFO";
    el("proposed-amount").textContent = currency.format(data.proposed_amount_vnd);
    el("reply").textContent = data.reply;
    el("issue-type").textContent = ISSUE_TYPES[data.issue_type];
    el("processing-mode").textContent = processingMode(data);
    el("processing-mode").dataset.mode = data.reason_code === "MODEL_UNAVAILABLE" ? "unavailable"
      : data.meta?.mode === "mock" ? "mock" : data.reason_code === "RULES_UNAVAILABLE" ? "unavailable"
        : data.meta?.mode === "live" && data.meta.ai_used === true ? "live" : "neutral";
    el("policy-rule").textContent = data.policy_ref ? `${data.policy_ref.rule_id} · Quy tắc giả lập` : "Không có tham chiếu quy tắc";
    el("policy-version-row").hidden = data.policy_ref === null;
    el("policy-version").textContent = data.policy_ref?.version || "";
    el("reason-code").textContent = data.reason_code;
    el("decision-code").textContent = data.decision;
    root.querySelector(".technical-details").open = false;
    const unavailable = data.reason_code === "MODEL_UNAVAILABLE" ? "model-unavailable" : data.reason_code === "RULES_UNAVAILABLE" ? "rules-unavailable" : null;
    el("availability-notice").hidden = !unavailable;
    el("availability-notice").textContent = unavailable === "model-unavailable"
      ? "Hệ thống AI tạm thời không khả dụng. Phương án bên dưới là phản hồi dự phòng từ hệ thống; việc chuyển xem xét chỉ là mô phỏng."
      : unavailable === "rules-unavailable" ? "Hệ thống đang chờ tích hợp quy tắc. Đây chưa phải kết quả đối chiếu bồi thường hoàn chỉnh." : "";
    setState(unavailable || "success");
    announce(`${decision.title}. Số tiền đề xuất ${currency.format(data.proposed_amount_vnd)}. ${processingMode(data)}.`);
  }
  function renderError(kind, message, title) {
    setState(kind); el("error-message").textContent = message;
    el("error-title").textContent = title || (kind === "invalid-response" ? "Chưa thể hiển thị phương án" : "Chưa nhận được kết quả");
    announce(message, true);
  }
  function collectInput() { return { orderId: el("order-id").value, message: el("message").value, amount: el("requested-amount").value }; }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (activeRequest) return;
    clearValidation();
    const input = collectInput(); const errors = validateInput(input);
    if (Object.keys(errors).length) {
      setState("validation-error");
      for (const [key, message] of Object.entries(errors)) {
        const field = key === "message" ? "message" : "requested-amount";
        el(field).setAttribute("aria-invalid", "true"); el(`${key}-error`).textContent = message; el(`${key}-error`).hidden = false;
      }
      el(errors.message ? "message" : "requested-amount").focus(); announce(Object.values(errors).join(" "), true); return;
    }
    const id = ++sequence; const controller = new AbortController();
    activeRequest = { id, controller }; let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, TIMEOUT_MS);
    el("request-order").textContent = input.orderId || "Chưa có mã đơn";
    el("request-message").textContent = input.message.trim();
    renderLoading(true); setState("loading"); announce("Đang kiểm tra phương án xử lý...");
    try {
      const data = await requestComplaint(buildPayload(input), controller.signal);
      if (id !== sequence) return;
      renderResponse(data);
      el("decision-title").focus({ preventScroll: true });
      revealPanel();
    } catch (error) {
      if (id !== sequence) return;
      const message = timedOut ? "Quá thời gian chờ phản hồi. Vui lòng thử lại sau."
        : error instanceof RequestError ? error.message : "Không thể kết nối với hệ thống. Hãy kiểm tra kết nối rồi thử lại.";
      const title = timedOut ? "Phản hồi mất nhiều thời gian" : error instanceof RequestError ? error.title : "Không thể kết nối";
      renderError(error instanceof RequestError ? error.kind : "request-error", message, title);
      el("error-title").focus({ preventScroll: true });
      revealPanel();
    } finally {
      clearTimeout(timer);
      if (id === sequence) { activeRequest = null; renderLoading(false); }
    }
  });
  form.addEventListener("reset", (event) => { event.preventDefault(); resetUI(); });
  el("retry-button").addEventListener("click", () => { if (!activeRequest) form.requestSubmit(); });
  el("edit-button").addEventListener("click", () => {
    const field = el("order-id").value ? el("message") : el("order-id");
    field.focus({ preventScroll: true });
    field.scrollIntoView({ behavior: root.defaultView.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  });
  sampleButtons.forEach((button) => button.addEventListener("click", () => fillSample(button.dataset.sample)));
  formFields.forEach((field) => field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => {
    clearValidation(); clearSampleSelection(); updateCount();
    if (!activeRequest) {
      const hadFeedback = panel.dataset.state !== "idle";
      setState("idle");
      if (hadFeedback) announce("Thông tin đã thay đổi. Hãy kiểm tra lại phương án.");
    }
  }));
  updateCount();
  const instance = { renderResponse, resetUI, fillSample };
  interfaces.set(root, instance);
  return instance;
}

if (typeof document !== "undefined" && document.getElementById("complaint-form")) createInterface();
