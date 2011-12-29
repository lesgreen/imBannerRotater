/*
 * 	 imBannerRotater - a JQuery Plugin
 * 	 @author Les Green
 * 	 Copyright (C) 2009 Intriguing Minds, Inc.
 *   
 *   Version 2.0 - 20 May 2011
 *   1. Added 'steps' option
 *   2. Created continuous effect, no longer scrolls back to beginning (portfolio, steps, carousel)
 *   3. Can create portfolio from existing image on page
 *   
 *   Version 1.2 - 14 Jan 2011
 *   1. Added quotes around "class" so will work in IE and Safari
 *   
 *   Version 1.1 - 9 August 2010
 *   1. Added portfolio option: 
 *   	1. top and side navigation
 *   	2. description - option: side, botttom
 *   	3. Added easing - http://gsgd.co.uk/sandbox/jquery/easing/
 *   
 *      
 *   Version 1.0 - 3 July 2010
 *   1. Added interval option to have images fade in and out simultaneously when in 'rotate' mode
 *   2. Urls can be supplied for every mode, not just random
 *   3. Added title attribute to image data_map (image_title)
 *   4. Added Banner Carousel
 *   5. Added Global url_target. Default: '_blank'
 * 
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.

 *   Demo and Documentation can be found at:   
 *   http://www.grasshopperpebbles.com
 *   
 */
 
;(function($) {
	$.fn.extend({
        imBannerRotater: function(options) { 
        	opts = $.extend({}, $.bannerRotater.defaults, options);
			return this.each(function() {
				new $.bannerRotater(this, opts);
			});
        }
    });	

$.bannerRotater = function(obj, opts) {
	var $this = $(obj);
	var cId, margTop;
	var imgCnt = 0, totalItems = 0, displayWidth, currentIndex = 0, selectedIndex = 0, nLeft = 0, ttlWidth = 0;
	var aImages = [];
	if (opts.easing) {
		jQuery.easing.def = opts.easing;
	}
	if (opts.image_url) {
		if (opts.image_url == 'self') {
			doCreate('self');
		} else {
			var d = getDataString();
			doAjax('GET', opts.image_url, d, '', doCreate);
		}
	} else if (opts.images) {
		doCreate(opts.images);
	} else {
		alert("No Images to load");
	}
	
	function getDataString() {
		var str = '';
		$.each(opts.data, function(i, itm) {
			str += itm.name + "=" + itm.value + "&";							
		});
		//remove last "&"
		str = str.substr(0, (str.length-1));
		return str;
	};
		
	function doAjax(t, u, d, fnBefore, fnSuccess) {
		var dt = (opts.return_type == 'json') ? 'json' : 'text';
		$.ajax({
			type: t,
			url: u,
			data: d,
			dataType: dt,
			beforeSend: fnBefore, //function(){$("#loading").show("fast");}, //show loading just when link is clicked
			//complete: function(){ $("#loading").hide("fast");}, //stop showing loading when the process is complete
			success: fnSuccess,
			error: showError
	 	}); //close $.ajax(
	};
	
	function showError(XMLHttpRequest, textStatus, errorThrown) {
		console.log(textStatus);
	};
	
	function doCreate(data) {
		
		var img, tgt, url, ttl, desc, lnk, src, w, h, cId;
		var showVertNav = false;
		if (opts.return_type == 'list') {
			var daAR = data.split(',');
		} 
		if (data == 'self') {
			var id = $this.attr('id');
			var daAR = new Array();
			if ($('#'+id+ ' ul li').length <= 1) {
				cId = $this.attr('id');
				$('#'+cId).remove();
				return;
			}	
			$('#'+id+ ' ul li').each(function(i, itm) {
				lnk = $(this).children('a')[0];
				//console.log(lnk);
				if (lnk) {
					url = $(lnk).attr('href');
		            tgt = $(lnk).attr('target');
		            tgt = (tgt) ? tgt : '_blank';
		            img = $(lnk).children('img')[0];
		        } else {
		        	url = '';
		        	tgt = '';
		        	img = $(this).children('img')[0];
		        }
		        //console.log(img);
		        if ($(img).attr('src') == '') return;   
	            w = $(img).width();
	            h = $(img).height();
	            ttl = $(img).attr('alt');
	            if (ttl == '') {
	            	ttl = $(img).attr('title');
	            }
	            src = $(img).attr('src');
	           // console.log(src);
	            desc = $(this).children('div')[0];
	            desc = $(desc).html();
	            daAR[i] = new Array(src, url, ttl, desc, tgt, w, h);
	      	});
	
		} else {
			var daAR = new Array();
			$.each(data, function(i, itm) {
				if (opts.data_map.url_name) {
					ttl = (opts.data_map.image_title) ? itm[opts.data_map.image_title] : itm[opts.data_map.image_name];
					desc = (opts.data_map.image_desc) ? itm[opts.data_map.image_desc] : '';
					tgt = (opts.data_map.url_target) ? itm[opts.data_map.url_target] : opts.url_target;
					daAR[i] = new Array(itm[opts.data_map.image_name], itm[opts.data_map.url_name], ttl, desc, tgt);
				} else {
					daAR[i] = itm[opts.data_map.image_name];
				}	
			});
		}
		totalItems = daAR.length;
		if (totalItems > 1) {
			switch (opts.mode) {
				case 'random':
					createRandom(daAR);
					break;
				case 'rotate':
					createRotate(daAR);
					break;
				case 'carousel':
					createCarousel(daAR);
					break;
				case 'portfolio':
					createPortfolio(daAR);
					break;
				case 'steps':
					margTop = opts.steps_large_height - opts.steps_small_height;
					//createSteps(daAR);
					createPortfolio(daAR);
					break;			
			}
		} else {
			if (data == 'self') {
				cId = $this.attr('id');
				$('#'+cId).remove();
			}
		}
	};
	
	function createRandom(daAR) {
		img = new Image();
		if (opts.data_map.url_name) {
			var obj = getImageObject(daAR[Math.floor(Math.random() * daAR.length)]);
			$this.append($('<a></a>').attr({
				'href': obj.url,
				'target': obj.tgt
			}).append($(img).attr({
				src: obj.pic,
				title: obj.title
			})));
		}
		else {
			var pic = opts.base_path + daAR[Math.floor(Math.random() * daAR.length)];
			$this.append($(img).attr({
				src: pic,
				title: pic
			}));
		}
	};
	
	function createRotate(daAR){
		var img, obj;
		for (var i = 0; i < totalItems; i++) {
			img = new Image();
			if (opts.data_map.url_name) {
				obj = getImageObject(daAR[i]);
				var a = $('<a></a>').attr({
					'href': obj.url,
					'target': obj.tgt,
					'id': 'imImageRotate' + i
				}).css({
					'display': 'none',
					'position': 'relative',
					'zIndex': 1000 - (totalItems + i)
				}).append($(img).attr({
					src: obj.pic,
					title: obj.title
				})).appendTo($this);
				aImages[i] = $(a).width();
				
			}
			else {
				var pic = opts.base_path + daAR[i];
				$this.append($(img).attr({
					src: pic,
					title: daAR[i],
					'id': 'imImageRotate' + i
				}).css({
					'display': 'none',
					'position': 'relative',
					'zIndex': 1000 - (totalItems + i)
				}));
				aImages[i] = $(img).width();
			}
		}
		if (opts.interval) {
			setFadeInterval();
		}
		else {
			imgFadeIn();
		}
	};
	
	function createCarousel(daAR) {
		var img, obj, pic;
		cId = $this.attr('id');
						
		$this.append($('<div></div>').attr({
			"id": cId + "-imImageRotate-SlideCntnr",
			"class": "imImageRotate-SlideCntnr"
		}).append($('<div></div>').attr({
			"id": cId + "-imImageRotate-Slider",
			"class": "imImageRotate-Slider"
		})));
		
		for (var i = 0; i < totalItems; i++) {
			createImage(i, cId, doAR);
		}
		nLeft = aImages[0];
		setCarouselInterval();
	};
	
	/*function createCarouselOld(daAR) {
		var li, pic, obj;
		var ul = $('<ul></ul>').appendTo($this);
		for (var i = 0; i < totalItems; i++) {
			img = new Image();
			if (opts.data_map.url_name) {
				obj = getImageObject(daAR[i]);
				li = $('<li></li>').attr('id', 'imImageRotate' + i).append($('<a></a>').attr({
					'href': obj.url,
					'target': obj.tgt
				}).append($(img).attr({
					src: obj.pic,
					title: obj.title
				}))).appendTo($(ul));
				aImages[i] = $(li).width() + parseInt($(li).css('marginLeft'));
			}
			else {
				pic = opts.base_path + daAR[i];
				$('<li></li>').attr('id', 'imImageRotate' + i).append($(img).attr({
					src: pic,
					title: daAR[i]
				})).appendTo($(ul));
			}
		}
		nLeft = aImages[0];
		setCarouselInterval();
	};*/
	
	function createPortfolio(daAR) {
		cId = $this.attr('id');
		if (opts.image_url == 'self') {
			//console.log(cId);
			//$('#'+cId).empty();
			$('#'+cId).html('');
		}
		createCntnr(cId);
		createVerticalNavCntnr(cId);
		createSideNav(cId);
		if (opts.mode == 'steps') {
			$("#" + cId + "-imImageRotate-Slider").css('visibility', 'hidden');
		}
		for (var i = 0; i < totalItems; i++) {
			createImage(i, cId, daAR);
			createVerticalNav(cId, i);
		}
		if (opts.mode == 'steps') {
			$("#" + cId + "-imImageRotate-Slider").css('visibility', 'visible');
		}
		createVerticalNavClickEvent(cId);
		setDescDisplayOption(cId);
		displayWidth = $('#' + cId + "-imImageRotate-DisplayCntnr0").width();
		if (opts.interval) {
			setInterval(portfolioChange, opts.interval);
		}
	};
	
	function setFadeInterval() {
		intervalFadeIn();
		setInterval(intervalFadeOut, opts.interval);
	};
	
	function intervalFadeIn() {
		$("#imImageRotate"+imgCnt).fadeIn(opts.speed, function(){
			$("#imImageRotate"+imgCnt).css('left', '0px');
		});
	};
	
	function intervalFadeOut() {
		$("#imImageRotate"+imgCnt).fadeOut(opts.speed);
		if (imgCnt == totalItems - 1) {
			$("#imImageRotate"+imgCnt).css('left', -aImages[imgCnt]);
			imgCnt = 0;
		} else {
			imgCnt++;
		}
		//imgCnt = (imgCnt == totalItems - 1) ? 0 : imgCnt + 1;
		if (imgCnt == 0) {
			$("#imImageRotate0").css('left', 0);
		}
		else {
			$("#imImageRotate" + imgCnt).css('left', -aImages[imgCnt]);
		}
		intervalFadeIn();
	};
	
	function imgFadeIn() {
		$("#imImageRotate"+imgCnt).fadeIn(opts.speed, function(){
			imgFadeOut();
		});
	};
	
	function imgFadeOut() {
		$("#imImageRotate"+imgCnt).fadeOut(opts.speed, function(){
			imgCnt = (imgCnt == totalItems - 1) ? 0 : imgCnt + 1;
			imgFadeIn();
		});
	};
	
	function setCarouselInterval() {
		setInterval(imgCarousel, opts.interval);
	};
	
	function imgCarousel() {
		$('ul', $this).animate({left: -nLeft+'px'}, opts.speed, function() {
			var lPos = $('ul li:last', $this).offset();
			var thisPos = $this.offset();
			if ((lPos.left + $('ul li:last', $this).width()) < (thisPos.left + $this.width())) {
				imgCnt = 0;
				nLeft = 0;
			} else {
				imgCnt++;
				nLeft += aImages[imgCnt-1];
			}
			
			var img0 = $("#" + cId + "-imImageRotateImage" + currentIndex);
			$(img0).parent().parent().appendTo($("#" + cId + "-imImageRotate-Slider"));
			$(img0).width($(img).data('size').sW).css({'margin-top': margTop + 'px', 'margin-left': '0px'});
			
			
			
			var ul = $('<ul></ul>').appendTo($this);
		for (var i = 0; i < totalItems; i++) {
			img = new Image();
			if (opts.data_map.url_name) {
				obj = getImageObject(daAR[i]);
				li = $('<li></li>').attr('id', 'imImageRotate' + i).append($('<a></a>').attr({
					'href': obj.url,
					'target': obj.tgt
				}).append($(img).attr({
					src: obj.pic,
					title: obj.title
				}))).appendTo($(ul));
				aImages[i] = $(li).width() + parseInt($(li).css('marginLeft'));
			}
			else {
				pic = opts.base_path + daAR[i];
				$('<li></li>').attr('id', 'imImageRotate' + i).append($(img).attr({
					src: pic,
					title: daAR[i]
				})).appendTo($(ul));
			}
		}
		});
	};
	
	function portfolioMoveNext() {
		if (selectedIndex < totalItems-1) {
			selectedIndex++;
			showPortfolio();
		}
	};
	
	function portfolioMovePrev() {
		if (selectedIndex > 0) {
			selectedIndex--;
			showPortfolio();
		}
	};
		
	function portfolioChange() {
		selectedIndex = (selectedIndex < totalItems-1) ? selectedIndex + 1 : 0;
		showPortfolio();
	};
	
	function showPortfolio() {
		//setVertNav();
		//if (opts.mode == 'portfolio') {
			doPortfolioMove();	
		//} else {
			
		//}
		
	};
	
	function setVertNav() {
		$("#"+cId + "-imImageRotate-Vert-Nav ul li").removeClass('selected');
		var nav = $("#"+cId + "-imImageRotate-Vert-Nav ul li")[selectedIndex];
		$(nav).addClass('selected');
	};
	
	function doPortfolioMove() {
		var nextIndex = (selectedIndex < totalItems-1) ? selectedIndex + 1 : 0;
		var fin = -(selectedIndex * displayWidth);
		if (opts.mode == 'portfolio') {
			$("#" + cId + "-imImageRotate-Slider").animate({
				left: fin + 'px'
			}, opts.speed, function(){
				setVertNav();
			});
		} else {
		/*	$("#" + cId + "-imImageRotate-Slider").animate({
				left: fin + 'px', 
			}, opts.speed, function(){
				setVertNav();
			});*/
			var img0 = $("#" + cId + "-imImageRotateImage" + currentIndex);
			var img = $("#" + cId + "-imImageRotateImage" + selectedIndex);
			var img2 = $("#" + cId + "-imImageRotateImage" + nextIndex);
			var w = $(img0).css('width');
			//var img = $('#imImageRotateCntnr-imImageRotate-SlideCntnr #imImageRotateCntnr-imImageRotate-DisplayCntnr3 a img');
			$(img0).animate({
				'margin-left': '-'+w
			}, opts.speed, function() {
				setVertNav();
				$(img0).parent().parent().appendTo($("#" + cId + "-imImageRotate-Slider"));
				$(img0).width($(img).data('size').sW).css({'margin-top': margTop + 'px', 'margin-left': '0px'});
			});
			$(img).animate({
				width: $(img).data('size').sW,
				height: $(img).data('size').sH,
				'margin-top': margTop + 'px' 
			}, opts.speed );
			$(img2).animate({
				width: $(img2).data('size').lW,
				height: $(img2).data('size').lH,
				'margin-top': 0
			}, opts.speed);
		}
		currentIndex = selectedIndex;
	};
	
	function createCntnr(cId) {
		$this.append($('<div></div>').attr({
			"id": cId + "-imImageRotate-Side-Nav-Left",
			"class": "imImageRotate-Side-Nav"
		}).append($('<div></div>').attr({
			"id": cId + "-imImageRotate-PrevBtn",
			"class": "imImageRotate-PrevBtn"
		})), $('<div></div>').attr({
			"id": cId + "-imImageRotate-SlideCntnr",
			"class": "imImageRotate-SlideCntnr"
		}).append($('<div></div>').attr({
			"id": cId + "-imImageRotate-Slider",
			"class": "imImageRotate-Slider"
		})), $('<div></div>').attr({
			"id": cId + "-imImageRotate-Side-Nav-Right",
			"class": "imImageRotate-Side-Nav"
		}).append($('<div></div>').attr({
			"id": cId + "-imImageRotate-NextBtn",
			"class": "imImageRotate-NextBtn"
		})));
	};
	
	function createVerticalNavCntnr(cId) {
		if ((opts.show_vert_nav != '') || (opts.show_vert_nav != 'no')) {
			showVertNav = true;
			var vertNav = $('<div></div>').attr({
				"id": cId + "-imImageRotate-Vert-Nav",
				"class": "imImageRotate-Vert-Nav"
			}).append($('<ul></ul>'));
			if (opts.show_vert_nav == 'top') {
				$this.prepend($(vertNav));
			} else	if (opts.show_vert_nav == 'bottom') {
				$this.append($(vertNav));
			}
			$(vertNav).show();
		}
	};
	
	function createVerticalNav(cId, i) {
		if (showVertNav) {
			$("#"+cId + "-imImageRotate-Vert-Nav ul").append($('<li></li>').data('liIndex', i));
			if (i == 0) {
				$("#"+cId + "-imImageRotate-Vert-Nav ul li").attr('class', 'selected');
			}
		}
	};
	
	function createVerticalNavClickEvent(cId) {
		if (showVertNav) {
			$("#"+cId + "-imImageRotate-Vert-Nav ul li").click(function() {
				selectedIndex = $(this).data('liIndex');
				showPortfolio();
			});
		}
	};
	
	function createSideNav(cId) {
		if (opts.show_side_nav) {
			$('#'+cId+" .imImageRotate-Side-Nav").show();
			$('#'+cId+"-imImageRotate-NextBtn").click(function() {
				portfolioMoveNext();
			});
			$('#'+cId+"-imImageRotate-PrevBtn").click(function() {
				portfolioMovePrev();
			});
		}
	};
	
	function createImage(i, cId, daAR) {
		var img = new Image();
		if ((opts.data_map.url_name) || (opts.image_url == 'self')) {
			var obj = getImageObject(daAR[i]);
			$('<div></div>').attr({
				id: cId + "-imImageRotate-DisplayCntnr" + i,
				"class": "imImageRotate-DisplayCntnr"
			}).append($('<a></a>').attr({
				'href': obj.url,
				'target': obj.tgt
			}).append($(img).attr({
				src: obj.pic,
				title: obj.title,
				id: cId + "-imImageRotateImage" + i
			})),
			$('<div></div>').attr({
				id: cId + "-imImageRotate-TextCntnr" + i,
				"class": "imImageRotate-TextCntnr"
			}).append($('<h2></h2>').html(obj.title),
			$('<p></p>').html(obj.desc))
			).appendTo("#" + cId + "-imImageRotate-Slider");
			if (opts.mode == 'steps') {
				tf = initImageSize(img, i);
			}
			if (opts.image_url == 'self') {
				if ((opts.max_height) || (opts.max_width)) {
					tf = setMaxSize(img, daAR[i]);
				}
			}
			//if (i != 1) {
				//$(div).css('margin-top', margTop + 'px');
			//}
		}
		else {
			var pic = opts.base_path + daAR[i];
			$('<div></div>').attr('id', cId + "-imImageRotate-DisplayCntnr" + i).append($(img).attr({
				src: pic,
				title: daAR[i]
			})).appendTo("#" + cId + "-imImageRotate-Slider");
		}
	};
	
	function getImageObject(ar) {
		var obj =  new Object();
		obj.pic = opts.base_path + ar[0]; 
		obj.url = ar[1];
		obj.title = ar[2];
		obj.desc = ar[3],
		obj.tgt = ar[4];
		return obj;
	};
	
	function setDescDisplayOption(cId) {
		if (opts.show_desc == 'onhover') {
			$('#'+cId+' .imImageRotate-DisplayCntnr a').hover(
			    function () {
			    	$(this).siblings('.imImageRotate-TextCntnr').show();
			  	}, 
			  	function () {
			    	$(this).siblings('.imImageRotate-TextCntnr').hide();
			  	}
			);
		} else if (opts.show_desc == 'onload') {
			$('#'+cId+' .imImageRotate-TextCntnr').show();
		}
	};
	
	function setMaxSize(img, ar) {
		var imgH, imgSize;
		var w = ar[5];
		var h = ar[6];
		
		if (opts.max_height) {
			imgSize = getNewSize(w, h, opts.max_height, 'height');		
		} else if (opts.max_width) {
			imgSize = getNewSize(w, h, opts.max_width, 'width');
		}
		$(img).css({
			'width': imgSize[0],
			'height': imgSize[1]
		});
		return true;
	};
	
	function initImageSize(img, cnt) {
		var imgH, imgSize;
		var w = $(img).width();
		var h = $(img).height();
		imgSize = getNewSize(w, h, opts.steps_small_height, 'height');
		lrgSize = getNewSize(w, h, opts.steps_large_height, 'height');
		//imgH = (cnt == 1) ? opts.steps_large_height: opts.steps_small_height;
		//imgSize = getNewSize(w, h, imgH);
		if (cnt == 1) {
			$(img).css({
				'width': lrgSize[0],
				'height': lrgSize[1]
			});
		} else {
			$(img).css({
				'width': imgSize[0],
				'height': imgSize[1],
				'margin-top': margTop + 'px'
			});
		}
		
		//var el = $('#' +cId + "-imImageRotateImage" + cnt);
		$(img).data('size', { sW: imgSize[0], sH: imgSize[1], lW: lrgSize[0], lH: lrgSize[1] });
		//$.data(el, "size", { sW: imgSize[0], sH: imgSize[1], lW: lrgSize[0], lH: lrgSize[1] });
		//console.log($.data(img, "size").sW);	
		return true;
	
	};
	
	function adjustImageSize(nCurSize, nMaxSize) {
		var nPerc = (nCurSize > nMaxSize) ? nMaxSize/nCurSize : 1; 
		return nPerc;
	};

	function getNewSize(nW, nH, nMaxSize, sizeType) {
		var imgSize = new Array();
		var s = (sizeType == 'height') ? nH : nW;
		var nPerc = adjustImageSize(s, nMaxSize);
		var newH = nH*nPerc;
		var newW = nW*nPerc;
		imgSize.push(newW, newH);
		return imgSize;
	};
};

$.bannerRotater.defaults = {
	mode: 'random',//rotate, carousel, portfolio, steps
	//portfolio_cols: '1', // the number of columns. 1 is the default
	steps_large_height: '',
	steps_small_height: '',
	interval: '',//5000
	image_url: '',
	data: '',
	images: '',//can be used instead of image_url. contains comma delimited list of images
	return_type: 'list', //list, json
	base_path: '',
	url_target: '_blank',
	data_map: '', //{image_name: '', image_title: '', url_name: '', url_target: '_blank', image_desc: ''}
	speed: 1500,
	easing: 'easeOutElastic',
	show_side_nav: true,
	show_vert_nav: 'top', // bottom, 
	show_desc: 'onhover',// onload, never
	max_height: '',
	max_width: ''
};
})(jQuery);		   
