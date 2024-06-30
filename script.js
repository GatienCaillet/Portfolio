$(document).ready(function() {
    $("#primary-navbar a").on('click', function(e) {
        e.preventDefault();
        
        var targetId = $(this).attr('href').substring(1);
        var targetElement = $('#' + targetId);
        
        $('html, body').animate({
            scrollTop: targetElement.length ? targetElement.offset().top - 70 : 0
        }, 500);

        $('.navbar-collapse').removeClass('show');
    });
});

$(function() {
    $('.navbar-toggler').on('click', function() {
        $('.navbar-collapse').toggleClass('show');
    });
});