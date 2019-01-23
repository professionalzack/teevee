let showGenres = [];
let hunt;
let tv_id;

//AJAX

function getter(dest, successHandler) {
    let url = `https://api.themoviedb.org/3/${dest}`;
    $.get(url).done(function(response) {
        console.log(response);
        if (response.length === 0) {
        console.log('No response found!');
        } else {
        successHandler(response);
        }
    });
}

//DOM

function biographer(response) {
    let poster = (response.profile_path) ? `https://image.tmdb.org/t/p/w185${response.profile_path}` : `../images/no_image.png`;
    let $template = $('<biography>').addClass('biography');
    let $imgSec = $('<section>').addClass("featuredImage").append($('<img>').attr('src', poster));
    let $artSec = $('<section>').addClass("articleContent").append($('<h1>').text(response.name));
    let $bio = $('<section>').text(response.biography);
    let $clearfix = $('<div>').addClass("clearfix");

    $template.append($imgSec, $artSec, $bio, $clearfix);
    $("#main").append($template);
}

function showBoat(response) {
    console.log(response)
    response.genres.forEach(genre => {getGenre(genre.id)})
    let poster = (response.poster_path) ? `https://image.tmdb.org/t/p/w185${response.poster_path}` : `../images/no_image.png`;
    let creators = [];
    response.created_by.forEach(creator => {creators.push(creator.name)});
    let dates = (response.first_air_date) ? response.first_air_date.slice(0,4) : '';
        dates += (response.last_air_date) ? ` - ${response.last_air_date.slice(0,4)}` : '';

    let $template = $('<biography>').addClass('biography');
    let $imgSec = $('<section>').addClass("featuredImage").append($('<img>').attr('src', poster));
    let $artSec = $('<section>').addClass("articleContent").append($('<h1>').text(response.name), $('<h4>').text(showGenres.join(', ')), $('<h5>').text(dates));
    let $info = $('<section>').text(response.overview);
    let $creators = $('<section>').addClass("articleContent").append($('<h5>').text((creators.length > 0) ? `created by: ${creators.join(', ')}` : ' '));
    let $clearfix = $('<div>').addClass("clearfix");

    $template.append($imgSec, $artSec, $info, $creators, $clearfix);
    $("#main").append($template);
}

function showMaker(allData) {
    $.each(allData, function() {
        this.genre_ids.forEach(genre => {
           getGenre(genre)
        });
        let poster = (this.poster_path) ? `https://image.tmdb.org/t/p/w92${this.poster_path}` : `../images/no_image.png`;
        let date = (this.first_air_date) ? this.first_air_date.slice(0,4) : '';

        let $template = $('<article>').addClass('article');
        let $imgSec = $('<section>').addClass("featuredImage").append($('<img>').attr('src', poster));
        let $artSec = $('<section>').addClass("articleContent").append($('<h3>').text(this.original_name), $('<h6>').text(showGenres.join(', ')), $('<h5>').text(date));
        let $score = $('<section>').addClass("impressions").text(this.vote_count.toFixed(0) || '');
        let $clearfix = $('<div>').addClass("clearfix");
        $template.on('click', function(event) {
            let  showid = $(event.target.parentNode).data('id') || $(event.target.parentNode.parentNode).data('id');
            console.log($(event.target))
            console.log(showid);
            tv_id = showid;
            document.location.href = `shows.html#${showid}`;
        });
        $template.append($imgSec, $artSec, $score, $clearfix);
        $template.attr('data-id', this.id);
        $("#main").append($template);

        showGenres = [];
    });
}

//EVENTS

$('#search').on('click', 'a', function(event) {
    let value = $('input').val();
    $('input').val('');
    searchParser(value);
})

//QUERIES

function popularShows() {
    let url = `tv/popular?api_key=${apiKey}&language=en-US&page=1`;
    $('#main').empty();
    getter(url, showHandler);
}

function searchParser(query) {
    hunt = query;
    actorSearch(query, parceHandler)
}

function actorSearch(query, successHandler){
    let url = `search/person?api_key=${apiKey}&language=en-US&query=${query}&page=1&include_adult=false`;
    $('#main').empty();
    getter(url, successHandler)
    }

function showSearch(searchquery, successHandler) {
    let searchQuery = searchquery.replace(/ /g, "%20");
    let url = `search/tv?api_key=${apiKey}&language=en-US&query=${searchQuery}%20&page=1`;
    $('#main').empty();
    getter(url, successHandler);
}

function detailer(tvid){
    console.log("looking for " + tvid)
    let url = `tv/${tvid}?api_key=${apiKey}&language=en-US`;
    $('#main').empty();
    getter(url, showBoat);
}

//HANDLERS

function manHandler(response){
    let actor = response.results[0].id;
    let bio_url = `person/${actor}?api_key=${apiKey}&language=en-US&page=1`;
    let credits_url = `person/${actor}/tv_credits?api_key=${apiKey}&language=en-US&page=1`;  
    $('#main').empty();
    getter(bio_url, biographer);
    getter(credits_url, creditHandler);
}

function showHandler(response) {
    let allData = response.results;
    if (allData.length === 0) {$("#main").append($('<h2>').addClass("apology").text(`sorry, we could not find anything with that name. try again`))};
    showMaker(allData);
}

function creditHandler(response) {
    let allData = response.cast;
    showMaker(allData);
}

function parceHandler(response) {
    if (response.results.length > 0 && hunt.toLowerCase() == response.results[0].name.toLowerCase()) {
        console.log("actor search for " + hunt)
        actorSearch(hunt, manHandler)
    }else{
        console.log("show search for " + hunt)
        showSearch(hunt, showHandler)
    }
}

//HELPFUL

function getGenre(genreId){
  theGenres.forEach(genre => {
    if (genre.id === genreId) {
      showGenres.push(genre.name)
    }  
  });
}


