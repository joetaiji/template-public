const AC = 'active',
    FX = 'fixed',
    ScrollNo = 'scroll-no',
    srOnly = '.sr-only',    
    OpenTxt = '열기',
    CloseTxt = '닫기',
    $html = $('html');

/* Mobile detection ----------------------------------------------------------------- */
function isMobile() {
    return window.innerWidth < 1024; //ipad pro(1024)는 web화면
}
/*  initial setup of accessibility -------------------------------------------------- */
function accessInit(el) {
    $(el).attr('aria-expanded', 'false')
    //$(el).append('<span class="sr-only">' + OpenTxt + '</span>').attr('aria-expanded', 'false')
}

/* -------------------------------------------------------------------------------------
*   화면크기
------------------------------------------------------------------------------------- */
function zoom(el) {
    const   zoomLevels = [0.9, 1, 1.1, 1.2, 1.3],
            classNames = ['xsm', 'sm', 'md', 'lg', 'xlg'],
            $item = $(el);
    let zoom = 1;        
    
    $html.on('click', el, function(){
        const $na = $(this);

        $na.attr('aria-selected', true).parent().addClass(AC).siblings().removeClass(AC).children().removeAttr('aria-selected')/*.attr('aria-selected', false)*/
        $.each(classNames, function(index, className) {
            if ($na.hasClass(className)) zoom = zoomLevels[index];
        });
        //초기화
        if($na.hasClass('ico-reset')) {
            $html.css('zoom', 1);
            $item.eq(1).attr('aria-selected', true).parent().addClass(AC).siblings().removeClass(AC).children().removeAttr('aria-selected')/*.attr('aria-selected', false)*/
        }
        localStorage.setItem('zoomDefault', zoom);
        $html.css('zoom', zoom);
    })

    //로컬 저장
    zoom = localStorage.getItem('zoomDefault') || 1;
    $html.css('zoom', zoom);
    $.each(zoomLevels, function (index, zoomLevel){
        if(zoom == zoomLevel) $item.eq(index).attr('aria-selected', true).parent().addClass(AC)
    })
}

/*  ------------------------------------------------------------------------------------
*    gnb
------------------------------------------------------------------------------------- */
function gnb() {
    const   $gnb = $('#head_menu'),            
            $depth1 = $gnb.find('>li>a:not(.linkWindow)'),
            $depth2 = $gnb.find('.submenu>ul>li>a:not(.linkWindow)');

    //초기셋팅 - 1차뎁스 접근성, 2차뎁스 첫번째 메뉴 활성
    accessInit($depth1)
    accessInit($depth2)
    $gnb.find('>li>a.active').attr('aria-current', 'page')
    $('.subfirst').addClass(AC).find('>a').attr('aria-expanded', 'true')

    //1차, 2차뎁스 클릭
    $depth1.add($depth2).on('click', function(e) {
        const $na = $(this)

        e.preventDefault()
        $html.addClass(AC)//배경 dim처리
        $na.attr('aria-expanded', 'true').parent().addClass(AC).siblings().removeClass(AC).find('>a:not(.linkWindow)').attr('aria-expanded', 'false')
    })

    //2차뎁스 타이틀 생성
    $depth2.each(function(){
        if(!$(this).next().is("div")) $(this).after("<div></div>")
        $(this).next("div").prepend($(this).clone()).find('a').removeAttr('aria-expanded');
    })

    //열린 메뉴 닫기
    function gnbClose() {
        $depth1.attr('aria-expanded', 'false').parent().add($html).removeClass(AC)
    }    
    $html.on('click keyup', function(e) {
        if(!$(e.target).closest($gnb).length) gnbClose()
    })
    $(window).on('scroll', function() { gnbClose() }) //2차뎁스가 열린상태에서 스크롤시
}

/*  ------------------------------------------------------------------------------------
*    mGnb
------------------------------------------------------------------------------------- */
function mGnb(){
    const $mGnbWrap = $('.m-gnb-wrap'),
          $mGnb = $('.topmenu-all');

    $('.m-gnb-top-etc').prepend($('#header').find('.etc-ul').clone());  
    $mGnb.children('li').eq(0).addClass(AC)
    $('#m-gnb-open').on('click', function() {
        $(this).add($mGnbWrap).toggleClass(AC)
        $html.addClass(ScrollNo)
    })
    $mGnbWrap.on('click', '.ico-close', function() {
        $mGnbWrap.removeClass(AC)
        $html.removeClass(ScrollNo)
    })
    $mGnb.on('click', '>li>a', function(e) {
        e.preventDefault()
        $(this).parent().addClass(AC).siblings().removeClass(AC)
    })

    //모바일에서 Active 찾아서 활성화
    $mGnb.find('>li').each(function(){
        if ($(this).children().hasClass(AC)) {
            $(this).addClass(AC).siblings().removeClass(AC)            
        }       
    })  
    
}

/*  ------------------------------------------------------------------------------------
*   snb
------------------------------------------------------------------------------------- */
function snb(){
	const   $snb = $('#snb');

    // snb 접근성 세팅
    $snb.find('#left_menu_top li>a').each(function(){
        const   $na = $(this),
                $parent = $na.parent(),
                isActive = $parent.hasClass(AC);

        if (isActive) $na.attr('aria-current', 'page')
        if ($na.next('ul').length > 0) { //3차뎁스
            $na.attr('aria-expanded', isActive ? 'true' : 'false').removeAttr('aria-current')
            $parent.addClass('is-depth3')
        }
    });

    // 하위 3차뎁스를 갖고 있는 메뉴를 클릭했을때
    $snb.on('click', '.is-depth3>a', function(e) {
        const   $na = $(this),
                $parent = $na.parent(),
                isActive = $parent.hasClass(AC);
        
        e.preventDefault()
        if (!isActive){
            $parent.addClass(AC).siblings().removeClass(AC)
            $('.is-depth3').find('>a').attr('aria-expanded', 'false')
            $na.attr('aria-expanded', 'true')
        }
    }); 
}

/*  ------------------------------------------------------------------------------------
*   리스트 열고 닫기			listOpen('.sns .sns_btn', 'target클래스명') 
------------------------------------------------------------------------------------- */
function listOpen(el, target, noAnyClick){
    accessInit(el);

    const $el = $(el);

    $html.on('click', el, function(e) { 
        const   $na = $(this),
                $elTarget = $na.closest(target),
                isActive = $elTarget.hasClass(AC)

        e.preventDefault()     
        if(!isActive) $html.trigger('click')
        $elTarget.toggleClass(AC)     
        $na.attr('aria-expanded', isActive ? 'false' : 'true') 
        .find(srOnly).text(isActive ? OpenTxt : CloseTxt)
    })
    if(!noAnyClick){
        $html.on('click', function(e) {
            if(!$(e.target).closest(target).length){
                $(target).removeClass(AC)
                .find(el).attr('aria-expanded', 'false')
                .find(srOnly).text(OpenTxt)
            }
        })
    }
    $(target).on('click', '.btn-close', function(e){
        $el.trigger('click');
    })
}

/*  ------------------------------------------------------------------------------------
*   data값으로 열고 닫기			dataOpen('클릭할 클래스명') 
------------------------------------------------------------------------------------- */
function dataOpen(el){
    accessInit(el);

    $(el).on('click', function() {			
        const   $na = $(this),
                isActive = $na.hasClass(AC)
        $('#' + $na.data('id')).toggle();
        $na.toggleClass(AC).attr('aria-expanded', isActive ? 'false' : 'true').find(srOnly).text(isActive ? OpenTxt : CloseTxt);
    }) 
}

/*  ------------------------------------------------------------------------------------
*   팝업 또는 레이어 열고 닫기
------------------------------------------------------------------------------------- */
let $clickSpot;

function layerPopup(el){
    accessInit(el);
    const OL = 'opened-layer';

	$(el).on('click', function(e) {	
        e.preventDefault();

        $clickSpot = $(this);
        const isActive = $clickSpot.hasClass(AC);

        $clickSpot.toggleClass(AC).attr('aria-expanded', isActive ? 'false' : 'true')
		$('#' + $(this).data('id')).attr('tabindex', 0).fadeIn(300).focus().addClass(OL);
		$html.addClass(ScrollNo);
    })	

	$html.on('click', '.opened-layer .popup-close', function(e) {	
        e.preventDefault();
        $(this).closest('.opened-layer').removeAttr('tabindex').fadeOut(100).removeClass(OL);
		$html.removeClass(ScrollNo);
		$clickSpot.focus().removeClass(AC).attr('aria-expanded', 'false');
    })
}

/*  ------------------------------------------------------------------------------------
*    tab메뉴 - 페이지가 전환되는 탭메뉴(ex. depth4, depth5)             tabs(this)
*    tab메뉴와 콘텐츠가 포함된 경우                                     tabs(this, "탭콘텐츠")
------------------------------------------------------------------------------------- */
function tabs(el, cont) {
    const tabLi = $(el).find('>li').length
	$(el).addClass("num" + tabLi + "")

	
	//탭콘텐츠 내에서 전환되는 경우
	if(cont) {
        //탭메뉴 접근성
        $(el).find('li.active')
            .children('a, button').attr('aria-selected', true)
            .parent().siblings('li').find('>a, >button').attr('aria-selected', false)

        $(el).on("click", ">li>a, >li>button", function(e){
            $(this).attr('aria-selected', true).parent().addClass(AC)
            .siblings().removeClass(AC).find(">button, >a").attr('aria-selected', false)
            $("#"+$(this).data('id')).addClass(AC).siblings().removeClass(AC)
            e.preventDefault()
        })
	}else{
        //탭메뉴 접근성
        $(el).find('li.active')
            .children('a, button').attr('aria-current', 'page')

        //탭메뉴(모바일)
        $(el).find('li>a, li>button').on("click", function(e) {
            if (isMobile() && $(this).parent().hasClass(AC)) {
                e.preventDefault()
                $(this).parents(el).toggleClass(AC)
            }
        })
        //탭메뉴(모바일) : 벗어난 곳 클릭시 탭메뉴 닫히게
        $html.on('click', function(e) {
            if(!$(e.target).closest(el).length) $(el).removeClass(AC)
        })
    }
}


/* -------------------------------------------------------------------------------------
*   아코디언 - details로 수정( ※name속성을 W3C Validation에서 오류로 인식하기 때문에 data-name으로 그룹설정)
------------------------------------------------------------------------------------- */
function accordion(el){
    const $el = $(el)
    
    //전체 details 스캔해서 open 되어 있는거에 active지정
    $el.children('details').each(function(){
        $(this).attr('open') ? $(this).addClass(AC).find('summary i').append('<span class="sr-only">' + CloseTxt + '</span>') : $(this).removeClass(AC).find('summary i').append('<span class="sr-only">' + OpenTxt + '</span>')
    }) 
    
    //summary클릭했을때
	$el.on('click', 'summary', function(){           
        const   $details = $(this).parent('details'),
                isOpen = $details.attr('open'),
                $accordion = $(this).parents(el),
                $btnAll = $accordion.find('.btn-all');

        $details.toggleClass(AC, !isOpen).find("summary i .sr-only").text(!isOpen ? CloseTxt : OpenTxt)

        //details가 열리면? 전체버튼 닫기 : 열기
        $accordion.children('details').hasClass(AC) ? $btnAll.addClass(AC).find("span").text(CloseTxt) : $btnAll.removeClass(AC).find("span").text(OpenTxt)        
    })

    //전체 버튼 클릭했을때
    $el.on('click', '.btn-all', function () {
        $(this).hasClass(AC) ? $(this).parents(el).find('details.active summary').trigger('click') : $(this).parents(el).find('summary').trigger('click');
    })
}



/*  ------------------------------------------------------------------------------------
* dialog
------------------------------------------------------------------------------------- */

function dialogPop(){
    document.addEventListener('click', function(event) {
        const target = event.target;
        if (target.classList.contains('open-dialog')) {
            const dialogId = target.dataset.target;
            const dialog = document.getElementById(dialogId);
            if (dialog) {
                dialog.showModal();
            }
        } else if (target.classList.contains('btn-close') || target.closest('.btn-close') || target.classList.contains('btn-cancel')){
            const dialog = target.closest('.dialog');
            if (dialog) {
                dialog.close();
            }
        }
    });     
}
 

/*  ------------------------------------------------------------------------------------
* 첨부파일
------------------------------------------------------------------------------------- */
function fileLoad(fileBox) {
    let $fileBox = $(fileBox);
    $.each($fileBox, function(idx){
        var $this = $fileBox.eq(idx),
            $btnUpload = $this.find('[type="file"]'),
            $label = $this.find('.file-label');
        
        $btnUpload.on('change', function() {
            var $target = $(this),
                fileName = $target.val(),
                $fileText = $target.siblings('.file-name');
            $fileText.val(fileName);
        })        
        $btnUpload.on('focusin focusout', function(e) {
            e.type == 'focusin' ?
            $label.addClass('file-focus') : $label.removeClass('file-focus');
        })    
    })
}	

/* -------------------------------------------------------------------------------------
*   공통 - header 고정, top버튼, 접근성(아이콘, target처리)
------------------------------------------------------------------------------------- */
$(function(){
    //header 고정
    let lastScroll
    $(window).on('load scroll', function() {
        let scrollT = $(this).scrollTop()
        scrollT > lastScroll ? $('#header').addClass(FX) : $('#header').removeClass(FX)
        lastScroll = scrollT
    })
    //top버튼
    $(window).on('load scroll', function() {
        $(window).scrollTop() > 0 ? $('.go-top').addClass(FX) : $('.go-top').removeClass(FX)        
    }) 
    // web accessibility
	//$('[class*="ri-"]').attr('aria-hidden', 'true')
	$('a[target="_blank"]').attr('title', '새창으로 열림')
    $('.page-info .current strong').prepend('<span class="sr-only">현재 페이지</span>');
    $('.page-info .current b').prepend('<span class="sr-only">전체 페이지 수</span>');

    //모바일에서 원본이미지보기
    if(isMobile()){
        $('.img-zoom, .zoom_posi, .img').each(function(){
            const imgSrc = $(this).find('img').attr('src')
            $(this).append('<a href="' + imgSrc + '" target="_blank" title="이미지 새창열기" class="btn-zoom"></a>')
        })
    }

    //비밀번호 보기
    $('.btn-pw-view').on('click', function(){
        $(this).toggleClass(AC)
        var $pwInput = $(this).prev('input'), $srOnly = $(this).find(srOnly)
        $pwInput.attr('type') == 'password' ? $pwInput.attr('type', 'text').add($srOnly).text('비밀번호 숨기기') : $pwInput.attr('type', 'password').add($srOnly).text('비밀번호 보기')
    })  

})

