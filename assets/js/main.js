/**
* Template Name: Kelly
* Updated: Sep 18 2023 with Bootstrap v5.3.2
* Template URL: https://bootstrapmade.com/kelly-free-bootstrap-cv-resume-html-template/
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/
( function ()
{
  "use strict";

  const parellax_el = document.querySelectorAll( ".parellax" );
  const normal = document.querySelectorAll( ".normal" );

  const mained = document.querySelector( ".mained" );
  

  const parellel_text = document.querySelector( "parellax-name" );

  const name = document.querySelector( ".parellex-name" );

  window.onload = () =>
  {
    if ( window.innerWidth < 600 && mained != null)
    {
      document.querySelector( ".parellax-name-mob" ).style.fontSize = `${ window.innerWidth * 0.003 }rem`;
      document.querySelector( ".parellax-desc-mob" ).style.fontSize = `${ window.innerWidth * 0.002 }rem`;
      document.getElementById( "header" ).style.height = `${ Math.max( window.innerWidth * 0.1, 48 ) }px`;

    } else if(mained != null)
    {
      document.querySelector( ".parellax-name" ).style.fontSize = `${ window.innerWidth * 0.003 }rem`;
      document.querySelector( ".parellax-desc" ).style.fontSize = `${ window.innerWidth * 0.002 }rem`;
    }
  };


  window.addEventListener( "resize", () =>
  {
    if ( window.innerWidth < 600  && mained != null)
    {
      document.querySelector( ".parellax-name-mob" ).style.fontSize = `${ window.innerWidth * 0.003 }rem`;
      document.querySelector( ".parellax-desc-mob" ).style.fontSize = `${ window.innerWidth * 0.002 }rem`;
      document.getElementById( "header" ).style.height = `${ Math.max( window.innerWidth * 0.1, 48 ) }px`;
    } else if(mained != null)
    {
      document.querySelector( ".parellax-name" ).style.fontSize = `${ window.innerWidth * 0.003 }rem`;
      document.querySelector( ".parellax-desc" ).style.fontSize = `${ window.innerWidth * 0.002 }rem`;
    }
  } );


  let xVal = 0, yVal = 0;

  // const github = document.querySelector(".github").href = "https://www.github.com/komplex01"

  if ( window.innerWidth < 600 && mained != null)
  {
    parellax_el.forEach( ( el ) =>
    {
      mained.style.height = "100%";
      el.remove();
    } );
  } 
  else if(mained != null)
  {
    console.log( mained );
    mained.style.minWidth = "500px";
    document.querySelector( ".bg-down" ).style.minWidth = "500px";
    normal.forEach( ( el ) =>
    {
      mained.style.height = "100vh";
      el.remove();
    } );
  }

  window.addEventListener( "mousemove", ( e ) =>
  {
    if ( window.innerWidth > 600 )
    {
      xVal = e.clientX - window.innerWidth / 2;
      yVal = e.clientY - window.innerHeight / 2;

      parellax_el.forEach( ( el ) =>
      {
        let isleft = parseFloat( getComputedStyle( el ).left ) < window.innerWidth / 2 ? 1 : -1;
        let zVal = ( e.clientX - ( parseFloat( getComputedStyle( el ).left ) ) ) * isleft;
        let speedx = el.dataset.speedx;
        let speedy = el.dataset.speedx * window.innerHeight / window.innerWidth;
        let sppedz = el.dataset.speedz;
        el.style.transform = `translateX(calc(-50% + ${ -xVal * speedx }px)) translateY(calc(-50% + ${ yVal * speedy }px)) perspective(1000px) translateZ(${ zVal * 0.01 }px)`;
      } );
    };
  } );

  /**
   * Easy selector helper function
   */
  const select = ( el, all = false ) =>
  {
    el = el.trim();
    if ( all )
    {
      return [ ...document.querySelectorAll( el ) ];
    } else
    {
      return document.querySelector( el );
    }
  };

  /**
   * Easy event listener function
   */
  const on = ( type, el, listener, all = false ) =>
  {
    let selectEl = select( el, all );
    if ( selectEl )
    {
      if ( all )
      {
        selectEl.forEach( e => e.addEventListener( type, listener ) );
      } else
      {
        selectEl.addEventListener( type, listener );
      }
    }
  };

  /**
   * Easy on scroll event listener 
   */
  const onscroll = ( el, listener ) =>
  {
    el.addEventListener( 'scroll', listener );
  };

  /**
   * Scrolls to an element with header offset
   */
  const scrollto = ( el ) =>
  {
    let header = select( '#header' );
    let offset = header.offsetHeight;

    let elementPos = select( el ).offsetTop;
    window.scrollTo( {
      top: elementPos - offset,
      behavior: 'smooth'
    } );
  };

  /**
   * Back to top button
   */
  let backtotop = select( '.back-to-top' );
  if ( backtotop )
  {
    const toggleBacktotop = () =>
    {
      if ( window.scrollY > 100 )
      {
        backtotop.classList.add( 'active' );
      } else
      {
        backtotop.classList.remove( 'active' );
      }
    };
    window.addEventListener( 'load', toggleBacktotop );
    onscroll( document, toggleBacktotop );
  }

  /**
   * Mobile nav toggle
   */
  on( 'click', '.mobile-nav-toggle', function ( e )
  {
    select( '#navbar' ).classList.toggle( 'navbar-mobile' );
    this.classList.toggle( 'bi-list' );
    this.classList.toggle( 'bi-x' );
  } );

  /**
   * Mobile nav dropdowns activate
   */
  on( 'click', '.navbar .dropdown > a', function ( e )
  {
    if ( select( '#navbar' ).classList.contains( 'navbar-mobile' ) )
    {
      e.preventDefault();
      this.nextElementSibling.classList.toggle( 'dropdown-active' );
    }
  }, true );

  /**
   * Scrool with ofset on links with a class name .scrollto
   */
  on( 'click', '.scrollto', function ( e )
  {
    if ( select( this.hash ) )
    {
      e.preventDefault();

      let navbar = select( '#navbar' );
      if ( navbar.classList.contains( 'navbar-mobile' ) )
      {
        navbar.classList.remove( 'navbar-mobile' );
        let navbarToggle = select( '.mobile-nav-toggle' );
        navbarToggle.classList.toggle( 'bi-list' );
        navbarToggle.classList.toggle( 'bi-x' );
      }
      scrollto( this.hash );
    }
  }, true );

  /**
   * Scroll with ofset on page load with hash links in the url
   */
  window.addEventListener( 'load', () =>
  {
    if ( window.location.hash )
    {
      if ( select( window.location.hash ) )
      {
        scrollto( window.location.hash );
      }
    }
  } );

  /**
   * Preloader
   */
  let preloader = select( '#preloader' );
  if ( preloader )
  {
    window.addEventListener( 'load', () =>
    {
      preloader.remove();
    } );
  }

  /**
   * Porfolio isotope and filter
   */
  window.addEventListener( 'load', () =>
  {
    let portfolioContainer = select( '.portfolio-container' );
    if ( portfolioContainer )
    {
      let portfolioIsotope = new Isotope( portfolioContainer, {
        itemSelector: '.portfolio-item'
      } );

      let portfolioFilters = select( '#portfolio-flters li', true );

      on( 'click', '#portfolio-flters li', function ( e )
      {
        e.preventDefault();
        portfolioFilters.forEach( function ( el )
        {
          el.classList.remove( 'filter-active' );
        } );
        this.classList.add( 'filter-active' );

        portfolioIsotope.arrange( {
          filter: this.getAttribute( 'data-filter' )
        } );
        portfolioIsotope.on( 'arrangeComplete', function ()
        {
          AOS.refresh();
        } );
      }, true );
    }

  } );

  /**
   * Initiate portfolio lightbox 
   */
  const portfolioLightbox = GLightbox( {
    selector: '.portfolio-lightbox'
  } );

  /**
   * Initiate portfolio details lightbox 
   */
  const portfolioDetailsLightbox = GLightbox( {
    selector: '.portfolio-details-lightbox',
    width: '90%',
    height: '90vh'
  } );

  /**
   * Portfolio details slider
   */
  new Swiper( '.portfolio-details-slider', {
    speed: 400,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  } );

  /**
   * Skills animation
   */
  let skilsContent = select( '.skills-content' );
  if ( skilsContent )
  {
    new Waypoint( {
      element: skilsContent,
      offset: '80%',
      handler: function ( direction )
      {
        let progress = select( '.progress .progress-bar', true );
        progress.forEach( ( el ) =>
        {
          el.style.width = el.getAttribute( 'aria-valuenow' ) + '%';
        } );
      }
    } );
  }

  /**
   * Testimonials slider
   */
  new Swiper( '.testimonials-slider', {
    speed: 600,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false
    },
    slidesPerView: 'auto',
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  } );

  /**
   * Animation on scroll
   */
  window.addEventListener( 'load', () =>
  {
    AOS.init( {
      duration: 1000,
      easing: "ease-in-out",
      once: true,
      mirror: false
    } );
  } );

  /**
   * Initiate Pure Counter 
   */
  new PureCounter();

} )();