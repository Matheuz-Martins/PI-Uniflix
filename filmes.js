// Array inicial de filmes
var listaFilmes = [];

// Função para exibir os filmes na tela
function exibirFilmes(filmes, limite) {
  var container = $('#movies-container');
  container.empty();

  filmes.slice(0, limite).forEach(function(filme) {
    var movieElement = $('<div>').addClass('movie').attr('data-id', filme.id);
    var posterElement = $('<img>').attr('src', 'https://image.tmdb.org/t/p/w500' + filme.poster_path);
    var titleElement = $('<p>').addClass('movie-title').text(filme.title);

    movieElement.append(posterElement, titleElement);
    container.append(movieElement);
  });
}

// Função para pesquisar filmes
function pesquisarFilmes() {
  var searchTerm = $('#search-input').val();

  if (searchTerm === '') {
    exibirFilmes(listaFilmes, 6);
  } else {
    $.ajax({
      url: 'https://api.themoviedb.org/3/search/movie',
      type: 'GET',
      data: {
        api_key: '038564ad2a27b04f31cc94c7e0b2313c',
        query: searchTerm
      },
      success: function(response) {
        exibirFilmes(response.results, response.results.length);
      },
      error: function(error) {
        console.log('Erro ao pesquisar o Filme:', error);
      }
    });
  }
}

$(document).ready(function() {
  // Evento de clique do botão de pesquisa
  $('#search-button').click(function() {
    pesquisarFilmes();
  });

  // Evento de tecla pressionada no campo de pesquisa
  $('#search-input').keypress(function(event) {
    if (event.which === 13) {
      pesquisarFilmes();
    }
  });

  // Obter os filmes iniciais
  $.ajax({
    url: 'https://api.themoviedb.org/3/discover/movie',
    type: 'GET',
    data: {
      api_key: '038564ad2a27b04f31cc94c7e0b2313c',
      sort_by: 'popularity.desc'
    },
    success: function(response) {
      listaFilmes = response.results;
      exibirFilmes(listaFilmes, 45);
    },
    error: function(error) {
      console.log('Erro ao obter os filmes:', error);
    }
  });

  // Evento de clique nos filmes
  $(document).on('click', '.movie', function() {
    var movieId = $(this).attr('data-id');
    var movieElement = $(this);
    var movieDetails = $('.movie-details');

    // Fazer uma requisição para obter os detalhes do filme pelo ID
    $.ajax({
      url: 'https://api.themoviedb.org/3/movie/' + movieId,
      type: 'GET',
      data: {
        api_key: '038564ad2a27b04f31cc94c7e0b2313c',
        append_to_response: 'credits,videos,watch/providers',
        language: 'pt-BR'
      },
      success: function(response) {
        // Remover qualquer descrição anteriormente exibida
        movieDetails.remove();

        // Criar o elemento para exibir os detalhes do filme
        movieDetails = $('<div>').addClass('movie-details');
        var posterElement = $('<img>').attr('src', 'https://image.tmdb.org/t/p/w500' + response.poster_path);
        var infoContainer = $('<div>').addClass('info-container');
        var titleElement = $('<h3>').addClass('movie-title').text(response.title);
        var descriptionElement = $('<p>').addClass('movie-description').text(response.overview);
        var closeButton = $('<button>').addClass('close-button').text('X');

        // Adicionar as informações adicionais
        var infoList = $('<ul>');
        infoList.append($('<li>').html('<span class="info-title">Data de Lançamento:</span> ' + response.release_date));
        infoList.append($('<li>').html('<span class="info-title">Gênero:</span> ' + response.genres.map(genre => genre.name).join(', ')));
        infoList.append($('<li>').html('<span class="info-title">Duração:</span> ' + response.runtime + ' minutos'));
        infoList.append($('<li>').html('<span class="info-title">Avaliação Média:</span> ' + response.vote_average));
        infoList.append($('<li>').html('<span class="info-title">Elenco Principal:</span> ' + response.credits.cast.slice(0, 5).map(actor => actor.name).join(', ')));
        if (response.videos.results.length > 0) {
          infoList.append($('<li>').html('<span class="info-title">Trailer:</span> <a href="https://www.youtube.com/watch?v=' + response.videos.results[0].key + '">Assistir</a>'));
        }
        if (response['watch/providers'] && response['watch/providers'].results.BR && response['watch/providers'].results.BR.link) {
          infoList.append($('<li>').html('<span class="info-title">Assista Agora:</span> <a target="_blank" href="' + response['watch/providers'].results.BR.link + '">Assistir</a>'));
        }

        infoContainer.append(titleElement, descriptionElement, infoList, closeButton);
        movieDetails.append(posterElement, infoContainer);
        $('body').append(movieDetails);

        // Adicionar a classe 'show' com um atraso para acionar a animação
        setTimeout(function() {
          movieDetails.addClass('show');
        }, 100);
      },
      error: function(error) {
        console.log('Erro ao obter os detalhes do filme:', error);
      }
    });
  });

  // Evento de clique no botão de fechar
  $(document).on('click', '.close-button', function() {
    var movieDetails = $('.movie-details');

    // Remover a classe 'show' para acionar a animação de fechamento
    movieDetails.removeClass('show');

    // Remover o elemento após a conclusão da animação
    setTimeout(function() {
      movieDetails.remove();
    }, 200);
  });
});
