/**
 * Sitewide "#swish" link handling — scans the page for `<a href="#swish">`
 * and swaps each for either a deep link (mobile) or a QR code (desktop).
 * Config comes from one global object, amrfSwish (Swish\FrontendProvider).
 */

function canRunSwish() {
	const platform = window.navigator.userAgentData?.platform;
	if (platform) return platform === 'Android' || platform === 'iOS';

	const ua = navigator.userAgent;
	if (/android|iphone|ipod/i.test(ua)) return true;

	if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 0) return true;

	return false;
}

function setupCopyOnClick(button, value) {
	let resetTimer;

	button.addEventListener('click', () => {
		if (!navigator.clipboard?.writeText) return;

		navigator.clipboard.writeText(value).then(() => {
			clearTimeout(resetTimer);
			button.textContent = window.amrfSwish?.copiedLabel || value;
			button.classList.add('is-copied');
			resetTimer = setTimeout(() => {
				button.textContent = value;
				button.classList.remove('is-copied');
			}, 1500);
		});
	});
}

function setupSwishLink(link) {
	if (link.dataset.swishReady) return;
	link.dataset.swishReady = 'true';

	if (canRunSwish() && window.amrfSwish?.swishUrl) {
		link.href = window.amrfSwish.swishUrl;
		return;
	}

	if (!window.amrfSwish?.qrSrc) return;

	const number = window.amrfSwish.qrAlt || '';

	const wrap = document.createElement('div');
	wrap.className = 'amrf-swish-qr-wrap';

	const img = document.createElement('img');
	img.src = window.amrfSwish.qrSrc;
	img.alt = number;
	img.loading = 'lazy';
	img.className = 'amrf-swish-qr';
	wrap.appendChild(img);

	if (number) {
		const numberButton = document.createElement('button');
		numberButton.type = 'button';
		numberButton.className = 'amrf-swish-qr-number';
		numberButton.textContent = number;
		numberButton.setAttribute('aria-live', 'polite');
		setupCopyOnClick(numberButton, number);
		wrap.appendChild(numberButton);
	}

	link.replaceWith(wrap);
}

document.querySelectorAll('a[href="#swish"]').forEach(setupSwishLink);
