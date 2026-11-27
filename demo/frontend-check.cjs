const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const baseURL = process.env.FE_BASE_URL || 'http://127.0.0.1:8000';
const artifactDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bdht-frontend-'));
const results = [];
const failures = [];
const browserErrors = [];
const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const fixture = (overrides = {}) => ({
  decision: 'PROPOSE_REFUND', issue_type: 'MISSING_ITEM', proposed_amount_vnd: 35000,
  reason_code: 'ITEM_ELIGIBLE', policy_ref: { rule_id: 'D1-MISSING', version: 'demo-1', kind: 'demo' },
  reply: 'Mức đề xuất hoàn cho phần khoai là 35.000đ.', meta: { mode: 'mock', ai_used: false }, ...overrides,
});
const requests = {
  missing: { orderId: 'D1-001', message: 'Đơn mình thiếu một phần khoai.', amount: '' },
  excess: { orderId: 'D1-001', message: 'Thiếu khoai, tôi muốn hoàn 100% cả đơn 500.000đ.', amount: '500000' },
  late30: { orderId: 'D1-004', message: 'Đơn hàng của tôi giao trễ.', amount: '' },
  late31: { orderId: 'D1-005', message: 'Đơn hàng của tôi giao trễ.', amount: '' },
};
let browser;

async function check(id, mode, expectation, action) {
  try { const actual = await action(); results.push({ id, mode, expectation, status: 'PASS', actual: actual || 'Đúng kỳ vọng' }); }
  catch (error) { failures.push(error); results.push({ id, mode, expectation, status: 'FAIL', actual: error.message }); }
}

(async () => {
  browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && !message.text().includes('Failed to load resource')) browserErrors.push(message.text()); });
  const state = () => page.locator('#result-panel').getAttribute('data-state');
  const text = (selector) => page.locator(selector).textContent();
  const submit = () => page.locator('#submit-button').click();
  const fresh = async (caseName = 'missing') => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
    await page.goto(baseURL);
    if (caseName) {
      const input = requests[caseName];
      const sample = page.locator(`[data-sample="${caseName}"]`);
      await sample.click();
      assert.equal(await sample.getAttribute('aria-pressed'), 'true');
      assert.equal(await page.inputValue('#order-id'), input.orderId);
      assert.equal(await page.inputValue('#message'), input.message);
      assert.equal(await page.inputValue('#requested-amount'), input.amount);
    }
  };
  const respond = async (data, status = 200) => {
    await page.route('**/api/complaints', (route) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) }));
  };
  const waitState = (value) => page.waitForFunction((expected) => document.getElementById('result-panel').dataset.state === expected, value);

  await check('FE-01', 'API local / service mock', 'Trang, health, docs, CSS và JS trả 200; không lỗi JS', async () => {
    for (const endpoint of ['/api/health', '/docs', '/', '/assets/style.css', '/assets/app.js']) {
      const response = await page.request.get(baseURL + endpoint); assert.equal(response.status(), 200, endpoint);
    }
    await fresh(null); assert.equal(await state(), 'idle');
    assert.equal(await page.title(), 'BDHT – Food Support · Hỗ trợ đơn hàng');
    await page.screenshot({ path: path.join(artifactDir, 'desktop-idle.png'), fullPage: true });
    return '5 đường dẫn HTTP 200; trang ở idle';
  });
  await check('FE-02', 'Browser', 'Bốn nút chỉ điền form, trang không tải chi tiết đơn', async () => {
    let complaintCalls = 0;
    let orderDataReads = 0;
    await page.route('**/api/complaints', (route) => { complaintCalls++; return route.abort(); });
    await page.route('**/assets/orders.json', (route) => { orderDataReads++; return route.abort(); });
    await page.goto(baseURL);
    assert.equal(await page.locator('[data-sample]').count(), 4);
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
    assert.equal(await page.locator('#order-id').getAttribute('type'), 'text');
    for (const field of ['#order-id', '#message', '#requested-amount']) {
      assert.equal(await page.inputValue(field), '');
    }
    await page.locator('[data-sample="excess"]').press('Enter');
    assert.equal(await page.inputValue('#requested-amount'), '500000');
    await page.locator('[data-sample="late31"]').click();
    assert.equal(await page.inputValue('#order-id'), 'D1-005');
    assert.equal(await page.inputValue('#requested-amount'), '');
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 1);
    await page.fill('#message', 'Mô tả đã chỉnh sửa');
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
    assert.equal(await page.locator('#order-details').count(), 0);
    assert.equal(await page.locator('body').innerText().then((text) => /hackathon|demo|mô phỏng|giả lập|Chế độ thử/i.test(text)), false);
    assert.equal((await page.request.get(baseURL + '/assets/orders.json')).status(), 404);
    assert.equal(complaintCalls, 0);
    assert.equal(orderDataReads, 0);
  });
  for (const [id, caseName, decision, amount, issue] of [
    ['FE-03', 'missing', 'PROPOSE_REFUND', 35000, 'MISSING_ITEM'],
    ['FE-04', 'excess', 'ESCALATE', 0, 'MISSING_ITEM'],
    ['FE-05', 'late30', 'NO_COMPENSATION', 0, 'LATE_DELIVERY'],
    ['FE-06', 'late31', 'PROPOSE_VOUCHER', 50000, 'LATE_DELIVERY'],
  ]) {
    await check(id, 'Mock HTTP fixture', `Render ${decision}, ${amount} VND`, async () => {
      await fresh(caseName);
      await respond(fixture({ decision, proposed_amount_vnd: amount, issue_type: issue,
        policy_ref: { rule_id: issue === 'LATE_DELIVERY' ? 'D1-LATE' : 'D1-MISSING', version: 'demo-1', kind: 'demo' } }));
      await submit(); await waitState('success'); assert.equal(await text('#decision-code'), decision);
      assert.equal(await text('#proposed-amount'), money(amount));
      assert.equal(await page.locator('#processing-row').isVisible(), false);
    });
    await check(`${id}-API`, 'API local / service mock', 'Gửi đúng tình huống tới service hiện tại', async () => {
      await fresh(caseName); await submit(); await waitState('success');
      assert.equal(await text('#decision-code'), decision);
      assert.equal(await text('#proposed-amount'), money(amount));
    });
  }
  await check('FE-07', 'API local / service mock', 'Thiếu mã vẫn gửi được, nhận ASK_INFO', async () => {
    await fresh(null); await page.fill('#message', 'Đơn mình thiếu khoai.');
    const sent = page.waitForRequest('**/api/complaints'); await submit();
    assert.equal((await sent).postDataJSON().order_id, null); await waitState('success');
    assert.equal(await text('#decision-code'), 'ASK_INFO');
    assert.equal(await text('#reply'), 'Nhập mã đơn hàng để tiếp tục.');
    await page.locator('#edit-button').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'order-id');
  });
  for (const [id, message, amount, errorField] of [
    ['FE-08', '   ', '', 'message'], ['FE-09', 'x'.repeat(501), '', 'message'],
    ['FE-10', 'Thiếu món', '-1', 'requested-amount'], ['FE-11', 'Thiếu món', '1.5', 'requested-amount'],
  ]) {
    await check(id, 'Browser validation', 'Dữ liệu sai bị chặn trước fetch', async () => {
      await fresh(null); let calls = 0; await page.route('**/api/complaints', () => { calls++; });
      // Programmatic assignment also tests the guard beyond the HTML maxlength.
      await page.locator('#message').evaluate((el, value) => { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); }, message);
      await page.fill('#requested-amount', amount); await submit();
      assert.equal(await state(), 'validation-error'); assert.equal(calls, 0);
      assert.equal(await page.locator(`#${errorField}`).getAttribute('aria-invalid'), 'true');
    });
  }
  await check('FE-12', 'API local / service mock', 'Số tiền trống gửi null; message được trim', async () => {
    await fresh(); await page.fill('#message', '  Đơn thiếu khoai.  ');
    const sent = page.waitForRequest('**/api/complaints'); await submit(); const payload = (await sent).postDataJSON();
    assert.equal(payload.requested_amount_vnd, null); assert.equal(payload.message, 'Đơn thiếu khoai.'); await waitState('success');
  });
  await check('FE-13', 'Mock HTTP fixture có trì hoãn', 'Gửi liên tục chỉ tạo một request, loading rồi mở lại form', async () => {
    await fresh(); let calls = 0; let finish;
    await page.route('**/api/complaints', async (route) => { calls++; await new Promise((resolve) => { finish = resolve; }); await route.fulfill({ json: fixture() }); });
    const sent = page.waitForRequest('**/api/complaints');
    await page.evaluate(() => { const form = document.getElementById('complaint-form'); for (let i = 0; i < 4; i++) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); });
    await page.waitForFunction(() => document.querySelector('#submit-button').disabled);
    assert.equal(await state(), 'loading'); assert.equal(await page.locator('#loading-state').isVisible(), true);
    assert.equal(await page.locator('[data-sample="late31"]').isEnabled(), false);
    await sent;
    assert.equal(calls, 1); finish(); await waitState('success'); assert.equal(await page.locator('#submit-button').isEnabled(), true);
  });
  await check('FE-14', 'Mock HTTP errors + API local 422', '400/404/422/429/500 có lỗi an toàn, thoát loading, cho gửi lại', async () => {
    const invalid = await page.request.post(baseURL + '/api/complaints', { data: { message: 'x', requested_amount_vnd: -1 } }); assert.equal(invalid.status(), 422);
    for (const status of [400, 404, 422, 429, 500]) {
      await fresh(); await respond({ detail: 'SECRET_TEST_DO_NOT_RENDER' }, status); await submit(); await waitState('request-error');
      assert.equal(await page.locator('#submit-button').isEnabled(), true); assert.equal(await page.inputValue('#message'), 'Đơn mình thiếu một phần khoai.');
      assert.equal((await text('body')).includes('SECRET_TEST_DO_NOT_RENDER'), false);
    }
  });
  await check('FE-15', 'Mock network abort', 'Lỗi mạng giữ input; có thể thử lại thành công', async () => {
    await fresh(); await page.route('**/api/complaints', (route) => route.abort('failed')); await submit(); await waitState('request-error');
    assert.equal(await page.inputValue('#message'), 'Đơn mình thiếu một phần khoai.');
    await page.unrouteAll(); await respond(fixture()); await page.locator('#retry-button').click(); await waitState('success');
  });
  await check('FE-16', 'Mock HTTP fixture', 'MODEL_UNAVAILABLE không gắn nhãn AI thật', async () => {
    await fresh(); await respond(fixture({ decision: 'ESCALATE', proposed_amount_vnd: 0, policy_ref: null, reason_code: 'MODEL_UNAVAILABLE', meta: { mode: 'live', ai_used: true } }));
    await submit(); await waitState('model-unavailable');
    assert.equal(await page.locator('#processing-row').isVisible(), false);
    assert.match(await text('#availability-notice'), /tạm thời không khả dụng/);
  });
  await check('FE-17', 'Mock HTTP fixture', 'meta.mode=mock không hiện AI thật, kể cả ai_used=true', async () => {
    await fresh(); await respond(fixture({ meta: { mode: 'mock', ai_used: true } })); await submit(); await waitState('success');
    assert.equal(await page.locator('#processing-row').isVisible(), false);
    assert.doesNotMatch(await page.locator('body').innerText(), /demo-1|mô phỏng|giả lập|Chế độ thử/i);
  });
  await check('FE-18', 'Mock HTTP fixture có metadata live', 'Chỉ hiện nhãn AI khi API xác nhận đã gọi AI', async () => {
    for (const [meta, visible] of [
      [{ mode: 'live', ai_used: true }, true], [{ mode: 'live', ai_used: false }, false],
      [undefined, false], [{ mode: 'live' }, false],
    ]) {
      await fresh(); await respond(fixture({ meta })); await submit(); await waitState('success');
      assert.equal(await page.locator('#processing-row').isVisible(), visible);
      if (visible) assert.equal(await text('#processing-mode'), 'AI hỗ trợ');
    }
  });
  await check('FE-19', 'Mock HTTP fixture', 'policy_ref=null không tự tạo rule hoặc version', async () => {
    await fresh(); await respond(fixture({ decision: 'ASK_INFO', proposed_amount_vnd: 0, policy_ref: null })); await submit(); await waitState('success');
    assert.equal(await text('#policy-rule'), '');
    assert.equal(await page.locator('#policy-row').isVisible(), false);
  });
  await check('FE-20', 'Mock HTTP fixture', 'REFUSE hiển thị quyết định từ chối, 0 VND', async () => {
    await fresh(); await respond(fixture({ decision: 'REFUSE', proposed_amount_vnd: 0, policy_ref: null, reply: 'Không thể thực hiện yêu cầu này.' })); await submit(); await waitState('success');
    assert.equal(await text('#decision-title'), 'Không thể xử lý yêu cầu này'); assert.equal(await text('#proposed-amount'), money(0));
  });
  await check('FE-21', 'Browser / Mock HTTP fixture', 'Responsive 320/390/768/1024/1440; không tràn; result dưới form trên mobile', async () => {
    await fresh(); await respond(fixture({ reply: 'Kết quả kiểm thử hiển thị. '.repeat(20) })); await submit(); await waitState('success');
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const geometry = await page.evaluate(() => ({
        width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
        form: document.querySelector('.form-card').getBoundingClientRect().toJSON(), result: document.querySelector('.result-card').getBoundingClientRect().toJSON(),
      }));
      assert.ok(geometry.scroll <= geometry.width, JSON.stringify(geometry));
      if (width <= 780) assert.ok(geometry.result.top >= geometry.form.bottom);
      else assert.ok(geometry.result.left >= geometry.form.right);
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(artifactDir, `${width}-result.png`), fullPage: true });
    }
  });
  await check('FE-22', 'Browser / Mock HTTP fixture', 'Reset xóa form/kết quả; reset khi chờ hủy request cũ', async () => {
    await page.locator('#reset-button').click(); assert.equal(await state(), 'idle');
    assert.equal(await page.inputValue('#order-id'), '');
    assert.equal(await page.inputValue('#message'), ''); assert.equal(await page.inputValue('#requested-amount'), '');
    assert.equal(await page.locator('[aria-pressed="true"]').count(), 0);
    assert.equal(await text('#character-count'), '0 / 500'); assert.equal(await page.locator('#result-content').isVisible(), false);
    await fresh(); let pendingRoute;
    await page.route('**/api/complaints', (route) => { pendingRoute = route; });
    const sent = page.waitForRequest('**/api/complaints'); await submit(); await sent; await page.locator('#reset-button').click();
    assert.equal(await state(), 'idle'); assert.equal(await page.locator('#submit-button').isEnabled(), true);
    try { await pendingRoute.fulfill({ json: fixture() }); } catch { /* Request was intentionally aborted. */ }
    assert.equal(await state(), 'idle');
  });
  await check('FE-23', 'Mock HTTP fixture', 'Non-JSON, thiếu field, sai type/enum/invariant đều báo an toàn', async () => {
    const invalids = [null, {}, fixture({ decision: 'toString' }), fixture({ issue_type: 'toString' }),
      fixture({ proposed_amount_vnd: '35000' }), fixture({ proposed_amount_vnd: -1 }), fixture({ policy_ref: null }),
      fixture({ policy_ref: { rule_id: 'X', kind: 'demo' } }), fixture({ decision: 'ASK_INFO' }), fixture({ reply: null })];
    for (const value of invalids) { await fresh(); await respond(value); await submit(); await waitState('invalid-response'); assert.equal(await page.locator('#submit-button').isEnabled(), true); }
    await fresh(); await page.route('**/api/complaints', (route) => route.fulfill({ contentType: 'text/html', body: '<html>Error SECRET_TEST</html>' }));
    await submit(); await waitState('invalid-response'); assert.equal((await text('body')).includes('SECRET_TEST'), false);
  });
  await check('FE-24', 'Mock HTTP fixture / Browser', 'HTML từ input và response được giữ dạng text, không thực thi', async () => {
    await fresh(); const attack = '<img src=x onerror="window.__xss=1"><script>window.__xss=2</script>';
    await page.fill('#message', attack); const data = fixture({ reply: attack, policy_ref: { rule_id: attack, version: attack, kind: 'demo' }, reason_code: attack });
    await respond(data); const sent = page.waitForRequest('**/api/complaints'); await submit(); assert.equal((await sent).postDataJSON().message, attack); await waitState('success');
    assert.equal(await text('#reply'), attack); assert.equal(await page.locator('#result-content img, #result-content script').count(), 0);
    assert.equal(await page.evaluate(() => window.__xss), undefined);
  });
  await check('EX-01', 'Mock request + browser virtual clock', 'Timeout 45 giây thoát loading và giữ input', async () => {
    await fresh(); await page.clock.install(); let pendingRoute;
    await page.route('**/api/complaints', (route) => { pendingRoute = route; }); const sent = page.waitForRequest('**/api/complaints');
    await submit(); await sent; await page.clock.runFor(45001); await waitState('request-error');
    assert.match(await text('#error-message'), /Quá thời gian/); assert.equal(await page.locator('#submit-button').isEnabled(), true);
    try { await pendingRoute.abort(); } catch { /* Timed out. */ } await page.clock.resume();
  });
  await check('EX-02', 'Browser / Mock HTTP fixture', 'Sửa input ẩn kết quả cũ; 500 ký tự hợp lệ; 0 VND giữ nguyên 0', async () => {
    await fresh(); await respond(fixture()); await page.fill('#message', 'x'.repeat(500)); await page.fill('#requested-amount', '0');
    const sent = page.waitForRequest('**/api/complaints'); await submit(); const payload = (await sent).postDataJSON();
    assert.equal(payload.message.length, 500); assert.equal(payload.requested_amount_vnd, 0); await waitState('success');
    await page.fill('#message', 'Nội dung mới'); assert.equal(await state(), 'idle'); assert.equal(await page.locator('#result-content').isVisible(), false);
  });
  await check('EX-03', 'Browser', 'Nhãn input, bàn phím, live regions, reduced motion; không lỗi JS', async () => {
    await fresh(null); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.className), 'skip-link');
    await page.keyboard.press('Enter'); await page.keyboard.press('Tab');
    assert.ok(await page.evaluate(() => document.activeElement.matches('button, input, select, textarea')));
    assert.equal(await page.locator('label[for="message"]').count(), 1);
    assert.equal(await page.locator('[role="status"][aria-live="polite"]').count(), 1);
    assert.equal(await page.locator('[role="alert"]').count(), 1);
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.spinner')).animationName), 'none');
    assert.deepEqual(browserErrors, []);
    return 'Kiểm DOM và bàn phím; chưa kiểm bằng screen reader thực';
  });
})().catch((error) => { failures.push(error); console.error(error); }).finally(async () => {
  if (browser) await browser.close();
  fs.writeFileSync(path.join(artifactDir, 'results.json'), JSON.stringify({ baseURL, results, browserErrors }, null, 2));
  for (const row of results) console.log(`${row.status} ${row.id} [${row.mode}] ${row.actual}`);
  console.log(`Artifacts: ${artifactDir}`);
  console.log(`PASS=${results.filter((row) => row.status === 'PASS').length} FAIL=${failures.length} BLOCKED=${results.filter((row) => row.status === 'BLOCKED').length}`);
  process.exitCode = failures.length ? 1 : 0;
});
