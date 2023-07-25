// Array inicial de séries
var listaSeries = [];

// Mapeamento dos provedores de streaming e seus logotipos
var provedores = {
  netflix: {
    logo: 'https://www.example.com/netflix_logo.png'
  },
  prime: {
    logo: 'https://www.example.com/prime_logo.png'
  },
  appletv: {
    logo: 'https://www.example.com/appletv_logo.png'
  }
};

// Função para exibir as séries na tela
function exibirSeries(series, limite) {
  var container = $('#series-container');
  container.empty();

  series.slice(0, limite).forEach(function(serie) {
    var serieElement = $('<div>').addClass('serie').attr('data-id', serie.id);
    var posterElement = $('<img>').attr('src', 'https://image.tmdb.org/t/p/w500' + serie.poster_path);
    var titleElement = $('<p>').text(serie.name);

    serieElement.append(posterElement, titleElement);

    // Adicionar os logotipos dos provedores de streaming
    if (serie.provider_logos && serie.provider_logos.length > 0) {
      var logoContainer = $('<div>').addClass('logo-container');

      serie.provider_logos.forEach(function(provider) {
        if (provedores[provider.provider_id]) {
          var logoElement = $('<img>').attr('src', provedores[provider.provider_id].logo);
          logoContainer.append(logoElement);
        }
      });

      serieElement.append(logoContainer);
    }

    container.append(serieElement);
  });
}

// Função para pesquisar séries
function pesquisarSeries() {
  var searchTerm = $('#search-input').val();

  if (searchTerm === '') {
    exibirSeries(listaSeries, 6);
  } else {
    $.ajax({
      url: 'https://api.themoviedb.org/3/search/tv',
      type: 'GET',
      data: {
        api_key: '038564ad2a27b04f31cc94c7e0b2313c',
        query: searchTerm
      },
      success: function(response) {
        exibirSeries(response.results, response.results.length);
      },
      error: function(error) {
        console.log('Erro ao pesquisar as Séries:', error);
      }
    });
  }
}

$(document).ready(function() {
  // Evento de clique do botão de pesquisa
  $('#search-button').click(function() {
    pesquisarSeries();
  });

  // Evento de tecla pressionada no campo de pesquisa
  $('#search-input').keypress(function(event) {
    if (event.which === 13) {
      pesquisarSeries();
    }
  });

  // Obter as séries iniciais
  $.ajax({
    url: 'https://api.themoviedb.org/3/discover/tv',
    type: 'GET',
    data: {
      api_key: '038564ad2a27b04f31cc94c7e0b2313c',
      sort_by: 'popularity.desc',
      with_original_language: 'en'
    },
    success: function(response) {
      listaSeries = response.results;
      exibirSeries(listaSeries, 45);
    },
    error: function(error) {
      console.log('Erro ao obter as séries:', error);
    }
  });

  // Evento de clique nas séries
  $(document).on('click', '.serie', function() {
    var serieId = $(this).attr('data-id');
    var serieElement = $(this);
    var serieDetails = $('.serie-details');

    // Fazer uma requisição para obter os detalhes da série pelo ID
    $.ajax({
      url: 'https://api.themoviedb.org/3/tv/' + serieId,
      type: 'GET',
      data: {
        api_key: '038564ad2a27b04f31cc94c7e0b2313c',
        append_to_response: 'credits,videos,watch/providers',
        language: 'pt-BR'
      },
      success: function(response) {
        // Remover qualquer descrição anteriormente exibida
        serieDetails.remove();

        // Criar o elemento para exibir os detalhes da série
        serieDetails = $('<div>').addClass('serie-details');
        var posterElement = $('<img>').attr('src', 'https://image.tmdb.org/t/p/w500' + response.poster_path);
        var infoContainer = $('<div>').addClass('info-container');
        var titleElement = $('<h3>').addClass('serie-title').text(response.name);
        var descriptionElement = $('<p>').addClass('serie-description').text(response.overview);
        var closeButton = $('<button>').addClass('close-button').text('X');

        // Adicionar as informações adicionais diretamente no código
        var infoList = $('<ul>');
        infoList.append('<li>Data de Lançamento: ' + response.first_air_date + '</li>');
        infoList.append('<li>Gênero: ' + response.genres.map(genre => genre.name).join(', ') + '</li>');
        infoList.append('<li>Número de Temporadas: ' + response.number_of_seasons + '</li>');
        infoList.append('<li>Número de Episódios: ' + response.number_of_episodes + '</li>');
        infoList.append('<li>Avaliação Média: ' + response.vote_average + '</li>');
        infoList.append('<li>Elenco Principal: ' + response.credits.cast.slice(0, 5).map(actor => actor.name).join(', ') + '</li>');
        if (response.videos.results.length > 0) {
          infoList.append('<li><a href="https://www.youtube.com/watch?v=' + response.videos.results[0].key + '">Trailer</a></li>');
        }
        if (response['watch/providers'] && response['watch/providers'].results.BR && response['watch/providers'].results.BR.link) {
          infoList.append('<li><a target="_blank" href="' + response['watch/providers'].results.BR.link + '">Assista Agora</a></li>');
        }

        infoContainer.append(titleElement, descriptionElement, infoList, closeButton);
        serieDetails.append(posterElement, infoContainer);
        $('body').append(serieDetails);

        // Adicionar a classe 'show' com um atraso para acionar a animação
        setTimeout(function() {
          serieDetails.addClass('show');
        }, 100);
      },
      error: function(error) {
        console.log('Erro ao obter os detalhes da série:', error);
      }
    });
  });

  // Evento de clique no botão de fechar
  $(document).on('click', '.close-button', function() {
    var serieDetails = $('.serie-details');

    // Remover a classe 'show' para acionar a animação de fechamento
    serieDetails.removeClass('show');

    // Remover o elemento após a conclusão da animação
    setTimeout(function() {
      serieDetails.remove();
    }, 200);
  });
});
