const DECISIONS = Object.freeze({
  PROPOSE_REFUND: { title: "Đề xuất hoàn tiền", icon: "check", tone: "positive" },
  PROPOSE_VOUCHER: { title: "Đề xuất voucher", icon: "ticket", tone: "positive" },
  ASK_INFO: { title: "Cần bổ sung thông tin", icon: "info", tone: "information" },
  ESCALATE: { title: "Cần nhân viên xem xét", icon: "escalate", tone: "warning" },
  NO_COMPENSATION: { title: "Chưa đủ điều kiện bồi thường", icon: "minus", tone: "neutral" },
  REFUSE: { title: "Không thể xử lý yêu cầu này", icon: "close", tone: "danger" },
});
const ISSUE_TYPES = Object.freeze({ MISSING_ITEM: "Giao thiếu món", WRONG_ITEM: "Giao sai món", LATE_DELIVERY: "Giao hàng trễ", UNKNOWN: "Chưa xác định" });
// Presentation labels for API reasons whose internal wording is specific to the fixture.
const CUSTOMER_REPLIES = Object.freeze({
  ORDER_ID_REQUIRED: "Nhập mã đơn hàng để tiếp tục.",
  ORDER_NOT_FOUND: "Kiểm tra mã đơn hàng rồi gửi lại yêu cầu.",
  ISSUE_UNCLEAR: "Mô tả rõ hơn sự cố với đơn hàng.",
  REQUEST_OUT_OF_SCOPE: "Công cụ hỗ trợ kiểm tra sự cố liên quan đến đơn hàng.",
  FOOD_SAFETY: "Liên hệ bộ phận hỗ trợ tại nơi đặt hàng để được xem xét.",
  MODEL_UNAVAILABLE: "Thử lại sau hoặc liên hệ bộ phận hỗ trợ tại nơi đặt hàng.",
  RULES_UNAVAILABLE: "Thử lại sau hoặc liên hệ bộ phận hỗ trợ tại nơi đặt hàng.",
  AMOUNT_EXCEEDS_LIMIT: "Số tiền vượt mức đủ điều kiện. Hãy liên hệ bộ phận hỗ trợ tại nơi đặt hàng.",
  NOT_ELIGIBLE: "Thông tin đối chiếu hiện chưa đủ điều kiện đề xuất bồi thường.",
  LATE_ELIGIBLE: "Thời gian giao vượt ngưỡng áp dụng voucher.",
});
const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
// Display-only snapshot of data/demo/orders.json. Sync the asset when fixtures change.
const ORDER_DATA_URL = "/assets/orders.json";
const orderDate = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh",
});
const isAmount = (value) => Number.isSafeInteger(value) && value >= 0;
const isOrderDate = (value) => value === null || (typeof value === "string" && Number.isFinite(Date.parse(value)) && /(?:Z|[+-]\d{2}:\d{2})$/.test(value));
const TIMEOUT_MS = 45000;
const interfaces = new WeakMap();
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isText = (value) => typeof value === "string" && value.trim().length > 0;

function validateOrders(orders) {
  return Array.isArray(orders) && orders.length > 0
    && orders.every((order) => isRecord(order) && isText(order.order_id) && isAmount(order.amount_paid_vnd)
      && isOrderDate(order.promised_at) && isOrderDate(order.delivered_at)
      && Array.isArray(order.items) && order.items.length > 0
      && order.items.every((item) => isRecord(item) && isText(item.name) && isAmount(item.qty) && isAmount(item.unit_paid_vnd)
        && [item.missing_qty, item.wrong_qty].every((count) => count === null || (isAmount(count) && count <= item.qty))))
    && new Set(orders.map((order) => order.order_id)).size === orders.length;
}

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
    || !isText(data.policy_ref.version) || !isText(data.policy_ref.kind))) return false;
  const proposal = ["PROPOSE_REFUND", "PROPOSE_VOUCHER"].includes(data.decision);
  return proposal ? data.proposed_amount_vnd > 0 && data.policy_ref !== null : data.proposed_amount_vnd === 0;
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
  const formFields = [el("order-id"), el("message"), el("requested-amount")];
  let activeRequest = null;
  let sequence = 0;
  let ordersById = new Map();
  let ordersState = "loading";

  function renderOrderDetails() {
    const order = ordersById.get(el("order-id").value);
    el("order-details").hidden = !order;
    el("order-items").replaceChildren();
    if (!order) return;
    el("order-details-title").textContent = `Chi tiết ${order.order_id}`;
    el("order-total").textContent = currency.format(order.amount_paid_vnd);
    el("order-promised").textContent = order.promised_at ? orderDate.format(new Date(order.promised_at)) : "Chưa có thông tin";
    el("order-delivered").textContent = order.delivered_at ? orderDate.format(new Date(order.delivered_at)) : "Chưa có thông tin";
    for (const item of order.items) {
      const row = root.createElement("tr");
      const nameCell = root.createElement("td");
      const name = root.createElement("span"); name.className = "order-item-name"; name.textContent = item.name;
      const note = root.createElement("small"); note.className = "order-item-note";
      const facts = [];
      if (item.missing_qty === null) facts.push("Thiếu món: chưa xác minh");
      else if (item.missing_qty > 0) facts.push(`Đã xác minh thiếu ${item.missing_qty} phần`);
      if (item.wrong_qty === null) facts.push("Sai món: chưa xác minh");
      else if (item.wrong_qty > 0) facts.push(`Đã xác minh sai ${item.wrong_qty} phần`);
      note.textContent = facts.length ? facts.join(" · ") : "Không ghi nhận thiếu/sai món";
      note.dataset.attention = String(facts.length > 0);
      nameCell.append(name, note);
      const quantity = root.createElement("td"); quantity.textContent = String(item.qty);
      const price = root.createElement("td"); price.textContent = currency.format(item.unit_paid_vnd);
      row.append(nameCell, quantity, price); el("order-items").append(row);
    }
  }
  async function loadOrders() {
    if (ordersState === "loading" && el("order-id").dataset.loading === "true") return;
    ordersState = "loading";
    const select = el("order-id"); select.disabled = true; select.dataset.loading = "true";
    el("orders-status").textContent = "Đang tải đơn hàng giả lập.";
    el("reload-orders").hidden = true;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(ORDER_DATA_URL, { headers: { Accept: "application/json" }, signal: controller.signal });
      if (!response.ok) throw new Error("Order data unavailable");
      const orders = await response.json();
      if (!validateOrders(orders)) throw new Error("Invalid order data");
      ordersById = new Map(orders.map((order) => [order.order_id, order]));
      const placeholder = root.createElement("option"); placeholder.value = ""; placeholder.textContent = "Chưa chọn đơn hàng";
      select.replaceChildren(placeholder);
      for (const order of orders) {
        const option = root.createElement("option"); option.value = order.order_id;
        option.textContent = `${order.order_id} · ${currency.format(order.amount_paid_vnd)}`;
        select.append(option);
      }
      ordersState = "ready";
      el("orders-status").textContent = `${orders.length} đơn giả lập. Có thể gửi khiếu nại khi chưa chọn đơn.`;
    } catch {
      ordersState = "error"; ordersById.clear();
      const placeholder = root.createElement("option"); placeholder.value = ""; placeholder.textContent = "Chưa tải được danh sách đơn";
      select.replaceChildren(placeholder);
      el("orders-status").textContent = "Không tải được đơn mẫu. Bạn vẫn có thể gửi nội dung khi chưa chọn đơn.";
      el("reload-orders").hidden = false;
    } finally {
      clearTimeout(timer); delete select.dataset.loading;
      select.disabled = Boolean(activeRequest) || ordersState !== "ready";
      renderOrderDetails();
    }
  }

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
    formFields.forEach((field) => { field.disabled = loading; });
    el("order-id").disabled = loading || ordersState !== "ready";
    el("submit-label").textContent = loading ? "Đang kiểm tra…" : "Kiểm tra phương án";
    panel.setAttribute("aria-busy", String(loading));
  }
  function setState(state) {
    panel.dataset.state = state;
    el("empty-state").hidden = !["idle", "validation-error"].includes(state);
    el("loading-state").hidden = state !== "loading";
    const hasResult = ["success", "model-unavailable", "rules-unavailable"].includes(state);
    el("result-content").hidden = !hasResult;
    el("error-state").hidden = !["request-error", "invalid-response"].includes(state);
    if (!hasResult) delete panel.dataset.decision;
    el("status-badge").textContent = {
      idle: "Chưa gửi",
      "validation-error": "Cần bổ sung",
      loading: "Đang xử lý",
      success: "Có kết quả",
      "model-unavailable": "Tạm gián đoạn",
      "rules-unavailable": "Tạm gián đoạn",
      "request-error": "Chưa có kết quả",
      "invalid-response": "Chưa có kết quả",
    }[state];
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
  function resetUI() {
    sequence += 1;
    activeRequest?.controller.abort(); activeRequest = null;
    renderLoading(false);
    clearValidation();
    formFields.forEach((field) => { field.value = ""; });
    renderOrderDetails();
    updateCount();
    el("result-content").querySelectorAll("dd:not(#processing-mode), #reply, #proposed-amount, #decision-title")
      .forEach((node) => { node.textContent = ""; });
    root.querySelector(".technical-details").open = false;
    setState("idle");
    announce("Đã xóa nội dung.");
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
    el("edit-button").hidden = data.decision !== "ASK_INFO";
    el("proposed-amount").textContent = currency.format(data.proposed_amount_vnd);
    el("reply").textContent = Object.hasOwn(CUSTOMER_REPLIES, data.reason_code)
      ? CUSTOMER_REPLIES[data.reason_code] : data.reply;
    el("issue-type").textContent = ISSUE_TYPES[data.issue_type];
    el("policy-row").hidden = data.policy_ref === null;
    el("policy-rule").textContent = data.policy_ref?.rule_id ?? "";
    el("reason-code").textContent = data.reason_code;
    el("decision-code").textContent = data.decision;
    root.querySelector(".technical-details").open = false;
    const unavailable = data.reason_code === "MODEL_UNAVAILABLE" ? "model-unavailable" : data.reason_code === "RULES_UNAVAILABLE" ? "rules-unavailable" : null;
    el("processing-row").hidden = Boolean(unavailable) || data.meta?.mode !== "live" || data.meta.ai_used !== true;
    el("availability-notice").hidden = !unavailable;
    el("availability-notice").textContent = unavailable === "model-unavailable"
      ? "Tính năng phân tích tạm thời không khả dụng."
      : unavailable === "rules-unavailable" ? "Dữ liệu đối chiếu tạm thời không khả dụng." : "";
    setState(unavailable || "success");
    announce(`${decision.title}. Số tiền đề xuất ${currency.format(data.proposed_amount_vnd)}.`);
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
  el("reload-orders").addEventListener("click", loadOrders);
  el("retry-button").addEventListener("click", () => { if (!activeRequest) form.requestSubmit(); });
  el("edit-button").addEventListener("click", () => {
    const reason = el("reason-code").textContent;
    const field = reason === "REQUESTED_AMOUNT_REQUIRED" ? el("requested-amount")
      : !el("order-id").value.trim() || reason === "ORDER_NOT_FOUND" ? el("order-id") : el("message");
    field.focus({ preventScroll: true });
    field.scrollIntoView({ behavior: root.defaultView.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  });
  formFields.forEach((field) => field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => {
    if (field.id === "order-id") renderOrderDetails();
    clearValidation(); updateCount();
    if (!activeRequest) {
      const hadFeedback = panel.dataset.state !== "idle";
      setState("idle");
      if (hadFeedback) announce("Thông tin đã thay đổi. Hãy kiểm tra lại phương án.");
    }
  }));
  updateCount();
  const instance = { renderResponse, resetUI };
  interfaces.set(root, instance);
  loadOrders();
  return instance;
}

if (typeof document !== "undefined" && document.getElementById("complaint-form")) createInterface();
