/**
 * Функции Ajax поиска	
 */
var Search = {

	suggestion_id:            'searchsuggestions',
	button_class:             'search-show',
	box_class:                'search-box',
	mask_class:               'search-mask',
	delay:                    200,
	search_delay:             false,
	search_value:             '',
	min_search:               2,
	suggestionHistory:        localStorage.getItem('searchSuggestionHistory') ? JSON.parse(localStorage.getItem('searchSuggestionHistory')) : [],
	suggestionHistory_count:  5,
	input:                    null,
	is_popup:                 false,
	active_suggest:           false,
	
	initialize: function(dle_min_search) {
	
		if( typeof dle_min_search === 'Number' || dle_min_search ) this.min_search = dle_min_search;

		if( this.button_class && $('.'+this.button_class).length > 0) {
			
			$('.'+this.button_class).unbind().click(function(e) {
				e.preventDefault();
				e.stopPropagation();
				Search.show();
				return false;
			});
				
			document.onkeyup = (t) => {
			  
			  if( t.which === 220 ) this.show();
			
			};
			
			this.is_popup = true;
			
		} else {
			
			this.bind();
			
			document.onkeyup = (t) => {
			  
			  if( t.which === 220 ) {
				  this.input.focus();
			  }
			  
			};			
			
		}

	},

	/**
	 * Бинды UI	
	 */
	bind: function() {
		
		
		if( this.input === null ) {
			
			this.input = $('.'+this.box_class).find('input[type="text"]');
			
		}

		this.input.attr('autocomplete', 'off');
		
		this.input.on("keyup", (t) => {
				
			if( t.which === 27 ) this.close();
				
		});		

		if( this.is_popup ) {
			
			$('.'+this.mask_class).on("click", () => this.close());
			
		} else {
			
			this.input.focus(() => {

				this.input.addClass('active');
				
				setTimeout(() => {
					this.showSuggest();
					this.active_suggest = true;
				}, 60);
				
			});			
			
			$(document).on("click", (t) => {
				
				let target_off = $(t.target).parents('.'+this.box_class).length;
				
				if( this.active_suggest && !target_off ) {
					$('#search-suggest').hide();
					this.active_suggest = false;
				}
				
			});
			
			
		}

		/**
		 * Функция очистки данных из поля
		 */
		$('#clear-search').on("click", () => {

			this.clear();			
			
		});
		
		/**
		 * Функция реагирования на ввод клавиш
		 */
		this.input.keyup((obj) => {
			
			let inputString = $(this.input).val();
			
			if( inputString.length == 0 ) {

				$('.'+this.box_class).find('#clear-search').hide();
				$('#'+this.suggestion_id).remove();
				$('#search-suggest').show();
				this.input.removeClass('active');
				this.search_value = '';

			} else {

				if (this.search_value != inputString && inputString.length >= this.min_search) {

					if( !$('#'+this.suggestion_id).length ) {
						
						let search_area = "<div id='"+this.suggestion_id+"' style='display: none'>"+
								"<div class='css-preloader-01'><div class='animation-wrap'><div class='css-animation theme'></div></div></div>"+
						"</div>";						
						
						$(this.input).addClass('active');
						$('#search-suggest').hide();
						
						if( this.is_popup ) {
							
							$('.'+this.box_class).find('.quicksearch').append(search_area);
							
						} else {
							
							$('.'+this.box_class).append(search_area);
							
						}
						
						$('.'+this.box_class).find('#clear-search').show();
						$('#'+this.suggestion_id).fadeIn('fast');

					}

					clearInterval(this.search_delay);

					this.search_delay = setInterval(() => this.find(inputString), this.delay);
				}

			}

		});

		return true;
	},
	
	clear: function() {
	
		$('.'+this.box_class).find('#clear-search').hide();
		$('#'+this.suggestion_id).remove();
		$('.'+this.box_class).find("input[type='text']").focus();
		$('#search-suggest').show();
		this.input.removeClass('active');
		this.search_value = '';
		this.input.val('');		
		
	},

	/**
	 * Добавление подсказки в историю
	 */	
	addSuggest: function(val) {
		
		if( !this.suggestionHistory.find(element => element.title === val.title) ) {

			if( this.suggestionHistory.length >= this.suggestionHistory_count ) {
				this.suggestionHistory.pop();
			}
				
			this.suggestionHistory.unshift(val);

		}
		
		localStorage.setItem('searchSuggestionHistory', JSON.stringify(this.suggestionHistory));	
		
		return true;
	},
	
	/**
	 * Удаление подсказки из историю
	 */	
	removeSuggest: function(val) {
		
		if( this.suggestionHistory.find(element => element.title === val) ) {

			let index = this.suggestionHistory.findIndex(element => element.title === val);
			
			delete this.suggestionHistory[index];
			
			this.suggestionHistory = this.suggestionHistory.filter(element => element !== null);
			
			if( !$('.layout-sc-area').length ) $('#search-suggest').hide();
		}
		
		localStorage.setItem('searchSuggestionHistory', JSON.stringify(this.suggestionHistory));	
		
		return true;
	},	
	
	/**
	 * Показывает подсказки
	 */	
	showSuggest: function() {
		
		if( $('#search-suggest').length ) $('#search-suggest').remove();

		if( this.suggestionHistory.length ) {

			let suggest_template = "<div class=\"layout-sc-area\" data-suggest=\"{title}\">"+
					"<div class=\"suggest-icon\"><figure><svg fill=\"currentColor\" width=\"100%\" height=\"100%\" viewBox=\"0 0 20 20\"><g><path d=\"M5.757 14.243A6 6 0 105.527 6H7v2H2V3h2v1.708a8 8 0 11.343 10.949l1.414-1.414z\"></path><path d=\"M11 10.414l1.707-1.707-1.414-1.414L9 9.586V14h2v-3.586z\"></path></g></svg></figure></div>"+
					"<div class=\"layout-sc\"><a href=\"{url}\">{title}</a></div>"+
					"<button class=\"clear-suggest\"><svg fill=\"currentColor\" width=\"100%\" height=\"100%\" viewBox=\"0 0 20 20\" x=\"0px\" y=\"0px\"><g><path d=\"M8.5 10L4 5.5 5.5 4 10 8.5 14.5 4 16 5.5 11.5 10l4.5 4.5-1.5 1.5-4.5-4.5L5.5 16 4 14.5 8.5 10z\"></path></g></svg></button>"+
			"</div>";
			
			if( this.is_popup ) {
							
				$('.'+this.box_class).find('.quicksearch').append("<div id='search-suggest' style='display: none'></div>");
							
			} else {
							
				$('.'+this.box_class).append("<div id='search-suggest' style='display: none'></div>");
						
			}			
			
			for (var i = 0, row; row = this.suggestionHistory[i]; i++) {
				
				$('#search-suggest').append(suggest_template.replace(/\{title\}/g, row.title).replace(/\{url\}/g, row.url));

			}
			
			$('.layout-sc-area .clear-suggest').click(function(e) {
				e.preventDefault();
				e.stopPropagation();							
				
				$(this).parents('.layout-sc-area').remove();
				Search.removeSuggest( $(this).parents('.layout-sc-area').data('suggest') );

				return false;
			});
			
			$('#search-suggest').show();	
			
		}		
		
		return true;
	},
	
	/**
	 * Ajax запрос поиска, изменение содержимого в блоке suggestion_id
	 */
	find: function(string) {

		clearInterval(this.search_delay);	
		
		if( this.is_popup ) {
							
			var width = $('.'+this.box_class).find('.quicksearch').width();
							
		} else {
							
			var width = $('.'+this.box_class).width();
					
		}		

		$.post(dle_root + "engine/ajax/controller.php?mod=search", {query: string, user_hash: dle_login_hash}, function(data) {

				$('#'+Search.suggestion_id).html(data).css({'position' : 'absolute', top:0, left:0, width: width+'px'}).position({
					my: "left top",
					at: "left bottom",
					of: "."+Search.box_class+" input[type='text']",
					collision: "fit flip"
				});
				
				if( $('#'+Search.suggestion_id).find('.search-result a').length ) {
					setTimeout(() => {
						$('#'+Search.suggestion_id).find('.search-result a').addClass('visible');
						
						$('.search-result [data-suggest]').click(function(e) {
							e.preventDefault();
							e.stopPropagation();
							
							let data 		= new Object;
								data.url	= $(this).attr('href');
								data.title	= $(this).data('suggest');
							
							Search.addSuggest( data );
							return window.location.href = data.url;
							//return nav.go(data.url);
						});
					}, 50);
				}
		});

		this.search_value = string;		

		return true;
	},
	
	
	/**
	 * Обновление поиска предворительно меняя значение cookie для результатов поиска
	 */
	changeSearch: function(obj) {

		if( $(obj).prop('checked') ) {
				
			setcookie('search_last_viewed', 1);
			this.find(this.search_value);
				
		} else {
				
			setcookie('search_last_viewed', 0);
			this.find(this.search_value);
				
		}
		
		return true;
	},	

	/**
	 * Первичное добавление UI элементов поиска, открытие UI
	 */
	show: function() {

		if( !$('.'+this.box_class).length ) {

			let search_template = "<div class=\""+this.box_class+"\">"+
					"<div class=\"quicksearch\">"+
						"<input placeholder=\"Поиск...\" name=\"story\" type=\"text\">"+
						"<button id=\"clear-search\" aria-label=\"left align\" type=\"submit\" style=\"display:none;\"><svg class=\"icon icon--circle_cross\"><use href=\"#icon--circle_cross\"></use></svg></button>"+
					"</div>"+
					"<div class=\"search-mask\"></div>"+
			"</div>";

			$('body').append(search_template);
			this.bind();

		} else {

			if( $('.'+this.box_class).find('.quicksearch').hasClass('show') ) return false;

			$('.'+this.box_class).show();

		}
		
		$('.'+this.mask_class).addClass('show');
		setTimeout(() => $('.'+this.box_class).find('.quicksearch').addClass('show'), 50);		

		this.input.focus();

		/**
		 * В зависимости от длительности анимации в css исполнение кода откладывается
		 */		
		setTimeout(() => this.showSuggest(),260);
		

		return true;
	},
	
	/**
	 * Закрытие UI
	 */
	close: function() {
		
		if( this.is_popup ) {
		
			$('#search-suggest').remove();
			$('#'+this.suggestion_id).remove();
			$('.'+this.box_class).find('.quicksearch').removeClass('show');
			$('.'+this.mask_class).removeClass('show');
			this.input.removeClass('active');

			/**
			 * В зависимости от длительности анимации в css исполнение кода откладывается
			 */
			setTimeout(() => {

				$('.'+this.box_class).hide();
				$('.'+this.box_class).find('#clear-search').hide();
				this.search_value = '';
				this.input.val('');			

			}, 205);

		} else {
			
			$('#search-suggest').remove();
			$('#'+this.suggestion_id).remove();
			this.input.removeClass('active');
			this.search_value = '';
			this.input.val('');				
			
		}
	}

}
