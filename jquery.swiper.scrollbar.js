/*!
 * Swiper Scrollbar 2.4
 * Plugin for Swiper 2.0+
 * http://www.idangero.us/sliders/swiper/
 *
 * Copyright 2012-2013, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 *
 * Licensed under GPL & MIT
 *
 * Released on: December 6, 2013
 */
(function($, undefined) {

	Swiper.prototype.plugins.scrollbar = function(swiper, params) {

		var options = $.extend({
			draggable: true,
			snapOnRelease: false
		}, params);

		var $container = $(options.container);
		if ($container.length === 0) {
			return;
		}

		var isHorizontal = swiper.params.mode === 'horizontal';
		var moveDivider;
		var dragWidth;
		var trackWidth;
		var dragHeight;
		var trackHeight;

		$container.each(function() {
			$('<div class="swiper_scrollbar_drag" />').toggleClass('swiper_scrollbar_cursor_drag', options.draggable).appendTo(this);
		});

		var $drag = $('.swiper_scrollbar_drag', $container);

		//Helper Function to set CSS3 Tranforms
		var setTransrate = function($elm, pos) {
			var x = String(pos.x || 0);
			var y = String(pos.y || 0);
			var z = String(pos.z || 0);

			if (swiper.support.threeD) {
				$elm.css({
					transform: 'translate3d(' + x + 'px, ' + y + 'px, ' + z + 'px)'
				});
			} else {
				$elm.css({
					transform: 'translate(' + x + 'px, ' + y + 'px)'
				});
				if (swiper.ie8) {
					$elm.css({
						left: x + 'px',
						top: y + 'px'
					});
				}
			}
		};

		var setTransition = function($elm, dur) {
			$elm.css({
				transitionDuration: String(dur) + 'ms'
			});
		};

		var setScrollBars = function() {
			var divider;
			if (isHorizontal) {
				trackWidth = $container.outerWidth();
				divider = swiper.width / swiper.wrapper.offsetWidth;
				moveDivider = divider * (trackWidth / swiper.width);
				dragWidth = trackWidth * divider;
				$drag.width(dragWidth);
				setTransrate($drag, {
					x: swiper.activeIndex * dragWidth
				});
			} else {
				trackHeight = $container.outerHeight();
				divider = swiper.height / swiper.wrapper.offsetHeight;
				moveDivider = divider * (trackHeight / swiper.height);
				dragHeight = trackHeight * divider;
				$drag.height(dragHeight);
				setTransrate($drag, {
					y: swiper.activeIndex * dragHeight
				});
			}
		};

		var setTransform = function(pos) {
			var diff;
			if (isHorizontal) {
				var newLeft = pos.x * moveDivider;
				var newWidth = dragWidth;
				if (newLeft > 0) {
					diff = newLeft;
					newLeft = 0;
					newWidth = dragWidth - diff;
				} else if (((-1 * newLeft) + dragWidth) > trackWidth) {
					newWidth = trackWidth + newLeft;
				}

				setTransrate($drag, {
					x: -1 * newLeft
				});
				$drag.width(newWidth);
			} else {
				var newTop = pos.y * moveDivider;
				var newHeight = dragHeight;
				if (newTop > 0) {
					diff = newTop;
					newTop = 0;
					newHeight = dragHeight - diff;
				} else if (((-1 * newTop) + dragHeight) > trackHeight) {
					newHeight = trackHeight + newTop;
				}
				setTransrate($drag, {
					y: -1 * newTop
				});
				$drag.height(newHeight);
			}
		};

		var setDragPosition = function(e) {
			var x = 0;
			var y = 0;
			if (isHorizontal) {
				var pageX = (e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].pageX : e.pageX || e.clientX;
				x = (pageX) - $container.offset().left - (dragWidth / 2);
				if (x < 0) {
					x = 0;
				} else if ((x + dragWidth) > trackWidth) {
					x = trackWidth - dragWidth;
				}
			} else {
				var pageY = (e.type === 'touchstart' || e.type === 'touchmove') ? e.targetTouches[0].pageY : e.pageY || e.clientY;
				y = (pageY) - $container.offset().top - (dragHeight / 2);
				if (y < 0) {
					y = 0;
				} else if ((y + dragHeight) > trackHeight) {
					y = trackHeight - dragHeight;
				}
			}

			//Set Drag Position
			setTransrate($drag, {
				x: x,
				y: y
			});

			//Wrapper Offset
			var wrapX = -1 * x / moveDivider;
			var wrapY = -1 * y / moveDivider;
			swiper.setWrapperTranslate(wrapX, wrapY, 0);
			swiper.updateActiveSlide(isHorizontal ? wrapX : wrapY);
		};

		var touchStart = function(e) {
			if (swiper.browser.ie8) {
				e = $.event.fix(e);
			}
			isTouched = true;
			e.preventDefault();

			if ($(e.target).is('.swiper_scrollbar_drag') === false) {
				swiper.setWrapperTransition(0);
			}

			setDragPosition(e);
			setTransition($container, 0);

			swiper.setWrapperTransition(100);
			setTransition($drag, 100);
		};

		var touchMove = function(e) {
			if (isTouched !== true) {
				return;
			}
			if (swiper.browser.ie8) {
				e = $.event.fix(e);
			}
			e.preventDefault();
			setDragPosition(e);
			swiper.setWrapperTransition(0);
			setTransition($container, 0);
			setTransition($drag, 0);
			if (params.onScrollbarDrag) {
				params.onScrollbarDrag(swiper)
			}
		};

		var touchEnd = function(e) {
			isTouched = false;
			if (options.snapOnRelease) {
				swiper.swipeReset();
			}
		};

		if (options.draggable) {
			var isTouched = false;
			var $lestenElm = $(swiper.support.touch ? $container : document);
			var events = swiper.touchEvents;

			$container.each(function() {
				swiper.h.addEventListener(this, events.touchStart, touchStart, false);
			});

			$lestenElm.each(function() {
				swiper.h.addEventListener(this, events.touchMove, touchMove, false);
			});

			$lestenElm.each(function() {
				swiper.h.addEventListener(this, events.touchEnd, touchEnd, false);
			});
		}

		var hooks = {
			onFirstInit: function(args) {
				setTimeout(setScrollBars, 0);
			},
			onInit: function(args) {
				setTimeout(setScrollBars, 0);
			},
			onSwipeReset: function() {
				var speed = swiper.params.speed;
				setTransition($drag, speed);
				swiper.setWrapperTransition(speed);
			},
			onSetWrapperTransform: function(pos) {
				setTransform(pos);
			},
			onSetWrapperTransition: function(args) {
				setTransition($drag, args.duration);
			},
			onDestroy: function() {
				$container.each(function() {
					swiper.h.removeEventListener(this, events.touchStart, touchStart, false);
				});

				$lestenElm.each(function() {
					swiper.h.removeEventListener(this, events.touchMove, touchMove, false);
				});

				$lestenElm.each(function() {
					swiper.h.removeEventListener(this, events.touchEnd, touchEnd, false);
				});
			}
		};
		return hooks;
	};

})(jQuery);
