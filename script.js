$(document).ready(function() {
    $("#primary-navbar a").on('click', function(e) {
        $('.navbar-collapse').removeClass('show');
    });
});

$(function() {
    $('.navbar-toggler').on('click', function() {
        $('.navbar-collapse').toggleClass('show');
    });
});