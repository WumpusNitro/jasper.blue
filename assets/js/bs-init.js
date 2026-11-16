
(function() {

	const loadStart = Date.now();
	const preloaders = document.querySelectorAll(".preloader");

	const prevOverflow = document.body.style.overflow;
	let scrollbarWidth = 0;
	let activePreloaders = preloaders.length;
	let preloaderShown = false;
	const removedPreloaders = new Set();

	// Storage access throws when the browser blocks site data. Show the preloader in that case.
	try {
		preloaderShown = !!sessionStorage.getItem("preloader-shown");

		if (preloaders.length) {
			sessionStorage.setItem("preloader-shown", "1");
		}
	} catch (e) {}

	if (preloaders.length && !preloaderShown) {
		disableOverflow();
	} else {
		for (const preloader of preloaders) {
			hidePreloader(preloader);
		}
		activePreloaders = 0;
	}

	function disableOverflow() {
		scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
		document.body.style.overflow = "hidden";

		if (scrollbarWidth > 0) {
			document.body.style.paddingRight = (parseFloat(getComputedStyle(document.body).paddingRight) + scrollbarWidth) + "px";
		}
	}

	function restoreOverflow() {
		activePreloaders--;
		if (activePreloaders > 0) return;

		document.body.style.overflow = prevOverflow;
		if (scrollbarWidth > 0) {
			const currentPadding = parseFloat(getComputedStyle(document.body).paddingRight);
			document.body.style.paddingRight = Math.max(currentPadding - scrollbarWidth, 0) + "px";
		}
	}

	function hidePreloader(preloader) {
		preloader.classList.remove("preloader-show");
	}

	function removePreloader(preloader) {
		// Both the min and max duration timeouts may call this
		if (removedPreloaders.has(preloader)) return;
		removedPreloaders.add(preloader);

		const animationName = preloader.dataset.preloaderExitAnimation;

		function onDone() {
			hidePreloader(preloader);
			restoreOverflow();
		}

		if (animationName) {
			animateCSS(preloader, animationName, onDone);
		}
		else {
			onDone();
		}
	}

	function animateCSS(node, animationName, callback) {
		// Finish anyway if animationend never fires, e.g. animate.css failed to load
		// or the preloader is hidden with d-none
		const fallback = setTimeout(finish, 3000);

		function handleAnimationEnd(e) {
			// Ignore animations of child elements
			if (e.target === node) finish();
		}

		function finish() {
			clearTimeout(fallback);
			node.classList.remove('animated', animationName);
			node.removeEventListener('animationend', handleAnimationEnd);

			if (typeof callback === 'function') callback();
		}

		node.classList.add('animated', animationName);
		node.addEventListener('animationend', handleAnimationEnd);
	}

	if (activePreloaders > 0) {
		// Hide after the max duration, even if the page is still loading
		for (const preloader of preloaders) {
			const maxDuration = parseInt(preloader.getAttribute("data-preloader-max-duration"), 10);

			if (!isNaN(maxDuration)) {
				setTimeout(() => {
					removePreloader(preloader);
				}, Math.max(maxDuration, 0));
			}
		}

		function onLoad() {
			const loadDuration = Date.now() - loadStart;

			for (const preloader of preloaders) {
				let minDuration = parseInt(preloader.getAttribute("data-preloader-min-duration"), 10);
				minDuration = isNaN(minDuration) ? 1200 : minDuration;

				setTimeout(() => {
					removePreloader(preloader);
				}, Math.max(minDuration - loadDuration, 0));
			}
		}

		if (document.readyState === "complete") {
			onLoad();
		} else {
			window.addEventListener("load", onLoad);
		}
	}

})();


if (window.innerWidth < 768) {
	[].slice.call(document.querySelectorAll('[data-bss-disabled-mobile]')).forEach(function (elem) {
		elem.classList.remove('animated');
		elem.removeAttribute('data-bss-hover-animate');
		elem.removeAttribute('data-aos');
		elem.removeAttribute('data-bss-parallax-bg');
		elem.removeAttribute('data-bss-scroll-zoom');
	});
}

document.addEventListener('DOMContentLoaded', function() {
	if ('AOS' in window) {
		AOS.init();
	}

(function(){

	if (!('requestAnimationFrame' in window)) return;

	var backgrounds = [];
	var parallaxBackgrounds = document.querySelectorAll('[data-bss-parallax-bg]');

	for (var el of parallaxBackgrounds) {
		var bg = document.createElement('div');

		bg.style.backgroundImage = el.style.backgroundImage;
		bg.style.backgroundSize = 'cover';
		bg.style.backgroundPosition = 'center';
		bg.style.position = 'absolute';
		bg.style.height = '200%';
		bg.style.width = '100%';
		bg.style.top = 0;
		bg.style.left = 0;
		bg.style.zIndex = -100;

		el.appendChild(bg);
		backgrounds.push(bg);

		el.style.position = 'relative';
		el.style.background = 'transparent';
		el.style.overflow = 'hidden';
	}

	if (!backgrounds.length) return;

	var visible = [];
	var scheduled;

	window.addEventListener('scroll', scroll);
	window.addEventListener('resize', scroll);

	scroll();

	function scroll() {

		visible.length = 0;

		for(var i = 0; i < backgrounds.length; i++){
			var rect = backgrounds[i].parentNode.getBoundingClientRect();

			if (rect.bottom > 0 && rect.top < window.innerHeight) {
				visible.push({
					rect: rect,
					node: backgrounds[i]
				});
			}

		}

		cancelAnimationFrame(scheduled);

		if (visible.length) {
			scheduled = requestAnimationFrame(update);
		}

	}

	function update(){

		for(var i = 0; i < visible.length; i++){
			var rect = visible[i].rect;
			var node = visible[i].node;

			var quot = Math.max(rect.bottom, 0) / (window.innerHeight + rect.height);

			node.style.transform = 'translate3d(0, '+(-50*quot)+'%, 0)';
		}

	}

})();
}, false);