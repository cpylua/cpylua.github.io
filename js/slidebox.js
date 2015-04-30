(function () {
    function translate($elem, x, options) {
        options = options || {};
        var noAnimation = !!options.noAnimation;

        if (x === undefined) {
            x = 0;
        }

        var cssString = 'translate(' + x + 'px, 0px)';
        var transitionString = noAnimation ? '' : '200ms ease-in-out';
        $elem.css({
            '-webkit-transform': cssString,
            'transform': cssString,

            '-webkit-transition': transitionString,
            'transition': transitionString
        });
    }

    function roundUp(numToRound, multiple) {
        if (multiple == 0)
            return numToRound;

        remainder = Math.abs(numToRound) % multiple;
        if (remainder == 0)
            return numToRound;
        if (numToRound < 0)
            return -(Math.abs(numToRound) - remainder);
        return numToRound - remainder;
    }

    function slowDown(distance) {
        function rate(d) {
            return (distance - d) / distance;
        }

        return function (d) {
            d = Math.abs(d);
            if (d > distance) {
                return 0;
            }
            return rate(d);
        }
    }

    window.Slidebox = function (slidebox) {
        function fixScrollPosition(scrollOffset) {
            var offset = scrollOffset;

            if (offset < RIGHT_EDGE) {
                offset = RIGHT_EDGE;
            } else if (offset > 0) {
                offset = 0;
            } else {
                var leftOffset = roundUp(offset, WIDTH);
                offset = (leftOffset - scrollOffset > WIDTH / 2) ? leftOffset - WIDTH : leftOffset;
            }

            return offset;
        }

        var $scroll = slidebox.find('.scroll');
        var $slides = slidebox.find('.slide');
        var lastDelta,
            WIDTH = slidebox.width(),
            RIGHT_EDGE = -WIDTH * ($slides.length - 1),
            scrollPos = 0,
            slideHandled = false;

        var slideOverSlowDown = slowDown(WIDTH / 2);

        $slides.forEach(function(slide, idx){
            var $slide = $(slide);
            $slide.data('slide-index', idx);

            var left = WIDTH * idx;
           translate($slide, left);

            var hammer = new Hammer(slide);

            $slide.on('touchstart', function (evt) {
                lastDelta = undefined;
                slideHandled = false;
            });

            $slide.on('touchend', function (evt) {
                if (slideHandled) {
                    return;
                }

                var offset = fixScrollPosition(scrollPos);
                if (offset !== scrollPos) {
                    scrollPos = offset;
                    translate($scroll, offset);
                }

                slideHandled = true;
            });

            hammer.on('pan', function (evt) {
                if (slideHandled) {
                    return;
                }

                var delta = evt.deltaX;
                var offset,
                    newScrollPos;

                if (!lastDelta) {
                    offset = delta;
                    lastDelta = delta;
                } else {
                    offset = delta - lastDelta;
                    lastDelta = delta;
                }

                // slow down when slide out of bound
                var pos = scrollPos + offset;
                if (pos > 0) {
                    newScrollPos = pos * slideOverSlowDown(offset);
                } else if (pos < RIGHT_EDGE) {
                    newScrollPos = -(RIGHT_EDGE - pos) * slideOverSlowDown(offset) + RIGHT_EDGE;
                } else {
                    newScrollPos = pos;
                }

                // slide only when position changes
                newScrollPos = parseInt(newScrollPos);
                if (newScrollPos !== scrollPos) {
                    scrollPos = newScrollPos;

                    translate($scroll, scrollPos, {
                        noAnimation: true
                    });
                }
            });

            hammer.on('swipeleft', function (evt) {
                scrollPos = roundUp(scrollPos, WIDTH) - WIDTH;
                if (scrollPos < RIGHT_EDGE) {
                    scrollPos = RIGHT_EDGE;
                }
                translate($scroll, scrollPos);
                slideHandled = true;
            });

            hammer.on('swiperight', function (evt) {
                scrollPos = roundUp(scrollPos, WIDTH);
                translate($scroll, scrollPos);
                slideHandled = true;
            });
        });
    };
}());