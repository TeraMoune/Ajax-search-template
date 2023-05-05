var Search = {

	result_id: 					'searchsuggestions',
	button_class: 				false,
	box_class: 					'search-box',
	mask_class: 				'search-mask',
	append_result_markup:		'quicksearch',
	result_auto_position:      	false,
	delay: 						200,
	min_search: 				2,
	search_result_area:      	false,
	key_bind:					{ show: '\\', close: 'Escape', moveDown: 'ArrowDown', moveUp: 'ArrowUp', currClick: 'Enter' },
	history:            		false,
	append_history_markup: 		false,
	suggestionHistory: 			localStorage.getItem('searchSuggestionHistory') ? JSON.parse(localStorage.getItem('searchSuggestionHistory')) : [],
	suggestionHistory_count: 	5,
	show_history_timeout:		500,
	css_timeout:				205,
	history_remove: 			'clear-suggest',

	history_markup:				'<div id="search-suggest" class="search-suggest"></div>',

	history_item:				`<div class="layout-sc-area" data-suggest="{title}">
									<div class="suggest-icon"><figure><svg fill="currentColor" width="100%" height="100%" viewBox="0 0 20 20"><g><path d="M5.757 14.243A6 6 0 105.527 6H7v2H2V3h2v1.708a8 8 0 11.343 10.949l1.414-1.414z"></path><path d="M11 10.414l1.707-1.707-1.414-1.414L9 9.586V14h2v-3.586z"></path></g></svg></figure></div>
									<div class="layout-sc"><a href="{url}">{title}</a></div>
									<button class="clear-suggest"><svg fill="currentColor" width="100%" height="100%" viewBox="0 0 20 20" x="0px" y="0px"><g><path d="M8.5 10L4 5.5 5.5 4 10 8.5 14.5 4 16 5.5 11.5 10l4.5 4.5-1.5 1.5-4.5-4.5L5.5 16 4 14.5 8.5 10z"></path></g></svg></button>
								</div>`,

	search_markup:				`<div class="search-box">
									<div class="quicksearch">
										<input placeholder="Поиск..." name="story" type="text">
										<button id="clear-search" aria-label="left align" type="submit" style="display:none;"><svg class="icon icon--circle_cross"><use href="#icon--circle_cross"></use></svg></button>
									</div>
									<div class="search-mask"></div>
								</div>`,

	search_result_markup:		`<div id="searchsuggestions" class="style_search_results">
									<div class='css-preloader-01'><div class='animation-wrap'><div class='css-animation theme'></div></div></div>
								</div>`,

	search_delay: 				false,
	search_value: 				'',
	input: 						null,
	is_popup: 					false,
	is_show: 					false,
	active_suggest: 			false,
	
	init: function(dle_min_search) {
	
		if( typeof dle_min_search === 'Number' && dle_min_search ) this.min_search = dle_min_search;

		if( this.button_class && $('.'+this.button_class).length > 0) {
			
			$('.'+this.button_class).unbind().click((event) => {
				event.preventDefault(); event.stopPropagation();

				this.show();
				return false;
			});

			document.addEventListener('keyup', (event) => {

					switch (event.key) {
						case this.key_bind.show:
							this.show();
						  break;
						case this.key_bind.close:
							this.close();
						  break;

					}
	
			});			
					
			this.is_popup = true;
			
		} else this.bind();

	},

	bind: function() {
		
		if( this.input === null ) {
			
			this.input = $('.'+this.box_class).find('input[type="text"]');

		}

		this.input.attr('autocomplete', 'off');
		
		if( this.key_bind ) {

			this.input.on("keyup keydown", (event) => {

				switch (event.key) {
					case this.key_bind.moveDown:
					case this.key_bind.moveUp:
						this.selected_move(event);
						break;

					case this.key_bind.currClick:

						if( event.type === 'keydown' ) return false;

						let current_pos = $('.'+this.box_class).find('[data-suggest].active:visible');

						if( current_pos.length ) {

							return ( current_pos[0].nodeName !== 'A' ? current_pos.find('a')[0].click() : current_pos.click() );

						}			
						break;

				}

			});

		}

		if( this.is_popup ) {
			
			$('.'+this.mask_class).on("click", () => {
				this.close();
			});
			
		} else {

			$(document).on("keyup", (event) => {
				
				switch (event.key) {
					case this.key_bind.show:
						this.input.focus();
						break;

				}
				
			}).on("click", (event) => {
				
				let target_off = $(event.target).parents('.'+this.box_class).length;
				
				if( this.active_suggest && !target_off ) {
					$('#search-suggest').hide();
					this.active_suggest = false;
				}
				
			});			
			
			this.input.focus(() => {

				this.input.addClass('active');
				
				setTimeout(() => {
					this.showSuggest();
					this.active_suggest = true;
				}, 60);
				
			});

			
		}

		$('#clear-search').on("click", () => {

			this.clear();
			
		});
		
		this.input.keyup((event) => {
			
			let inputString = event.target.value;
			
			if( inputString.length == 0 ) {

				$('.'+this.box_class).find('#clear-search').hide();
				$('#'+this.result_id).remove();
				$('#search-suggest').show();
				this.input.removeClass('active');
				this.search_value = '';

			} else {

				if (this.search_value != inputString && inputString.length >= this.min_search) {

					if( !$('#'+this.result_id).length ) {					
						
						this.input.addClass('active');
						$('#search-suggest').hide();
						
						if( this.append_result_markup ) {
							
							$('.'+this.append_result_markup).append(this.search_result_markup);
							
						} else {
							
							$('.'+this.box_class).append(this.search_result_markup);
							
						}
						
						$('.'+this.box_class).find('#clear-search').show();
						$('#'+this.result_id).fadeIn('fast');

					}

					clearInterval(this.search_delay);

					this.search_delay = setInterval(() => this.find(inputString), this.delay);
				}

			}

		});

		return true;
	},

	addSuggest: function(val) {

		if( !this.history ) return false;
		
		if( !this.suggestionHistory.find(element => element.title === val.title) ) {

			if( this.suggestionHistory.length >= this.suggestionHistory_count ) {
				this.suggestionHistory.pop();
			}
				
			this.suggestionHistory.unshift(val);

		}
		
		localStorage.setItem('searchSuggestionHistory', JSON.stringify(this.suggestionHistory));	
		
		return true;
	},

	removeSuggest: function(val) {

		if( !this.history ) return false;

		if( this.suggestionHistory.find(element => element.title === val) ) {

			let index = this.suggestionHistory.findIndex(element => element.title === val);
			
			delete this.suggestionHistory[index];
			
			this.suggestionHistory = this.suggestionHistory.filter(element => element !== null);
			
			if( !this.suggestionHistory.length ) document.getElementById('search-suggest').style.display = 'none';

		}

		localStorage.setItem('searchSuggestionHistory', JSON.stringify(this.suggestionHistory));	
		
		return true;
	},	
	 
	showSuggest: function() {

		if( !this.history || !this.history_item) return false;
		
		if( $('#search-suggest').length ) $('#search-suggest').remove();

		if( this.suggestionHistory.length ) {
			
			if( this.is_popup ) $('.'+this.box_class).find('.quicksearch').append(this.history_markup);				
			else $('.'+this.box_class).append(this.history_markup);
			
			for (var i = 0, row; row = this.suggestionHistory[i]; i++) {

				let item = this.history_item.replace(/\{title\}/g, row.title).replace(/\{url\}/g, row.url)
				
				if( this.append_history_markup ) $('#search-suggest').find('.'+this.append_history_markup).append(item);
				else $('#search-suggest').append(item);

			}
			
			if( this.history_remove ) {

				$('.'+this.history_remove).unbind().click((event) => {
					event.preventDefault();	event.stopPropagation();
					
					let target = event.target

					$(target).parents('[data-suggest]').remove();
					this.removeSuggest( $(target).parents('[data-suggest]').data('suggest') );
	
					return false;
				});

			}
			
			$('#search-suggest').show();	
			
		}		
		
		return true;
	},
	
	find: function(string) {

		clearInterval(this.search_delay);		
		
		$.post(dle_root + "engine/ajax/controller.php?mod=search", {query: string, user_hash: dle_login_hash}, (data) => {

			//added search result
			if( this.search_result_area ) {
				$('#'+this.result_id).find('.'+this.search_result_area).html(data);
			} else {
				$('#'+this.result_id).html(data);
			}

			//apply css position
			if( this.result_auto_position ) {
									
				let width = this.is_popup ? $('.'+this.box_class).find('.quicksearch').width() : $('.'+this.box_class).width();

				$('#'+this.result_id).css({
					position: 	'absolute', 
					top:		0, 
					left:		0, 
					width: 		width+'px'
				}).position({
					my: 		"left top",
					at: 		"left bottom",
					of: 		"."+this.box_class+" input[type='text']",
					collision: 	"fit flip"
				});

			}			
			
			if( $('#'+this.result_id).find('[data-suggest]').length ) {

				setTimeout(() => {

					$('#'+this.result_id).find('[data-suggest]').addClass('visible');
					
					$('#'+this.result_id).find('[data-suggest]').click((event) => {
						event.preventDefault();	event.stopPropagation();

						let target = event.target;
						
						if( target.href || target.dataset.suggest ) {

							let data 		= new Object;
								data.url	= target.href;
								data.title	= target.dataset.suggest;
								
							this.addSuggest( data );							

						}

						return window.location.href = data.url;
						//return nav.go(target.href);

					});

				}, 16);	

			}

		});

		this.search_value = string;		

		return true;
	},
	
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

	show: function() {

		if( !this.is_popup || this.is_show ) return false;

		if( !$('.'+this.box_class).length ) {

			$('body').append(this.search_markup);
			this.bind();

		} else $('.'+this.box_class).show();

		setTimeout(() => {

			if( this.mask_class && $('.'+this.mask_class).length ) $('.'+this.mask_class).addClass('show');
			$('.'+this.box_class).find('.quicksearch').addClass('show')

		}, 16);
		
		this.input.focus();

		if( this.history ) {
			setTimeout(() => this.showSuggest(), (this.show_history_timeout || this.css_timeout || 16));
		}	
		
		this.is_show = true;

		return true;
	},

	clear: function( mode = false ) {

		if( !mode ) {

			$('#'+this.result_id).remove();
			$('#search-suggest').show();
			$('.'+this.box_class).find('#clear-search').hide();
			$('.'+this.box_class).find("input[type='text']").focus();
			this.input.removeClass('active');

		}
				
		this.search_value = '';
		this.input.val('');		
		
	},	
	
	close: function() {

		if( !this.is_show ) return false;

		let timeout = this.css_timeout || 16;
		
		this.input.removeClass('active');
		$('#search-suggest, #'+this.result_id).remove();

		if( this.is_popup ) {

			$('.'+this.box_class).find('.quicksearch').removeClass('show');
			$('.'+this.mask_class).removeClass('show');
			
			setTimeout(() => {

				$('.'+this.box_class).hide();
				$('.'+this.box_class).find('#clear-search').hide();

				this.clear(true);	

			}, timeout);

		}
		
		this.is_show = false;
	},

	selected_move: function(event) {
		event.preventDefault();

		if( event.type === 'keyup' ) return false;

		let current_pos = $('.'+this.box_class).find('[data-suggest].active:visible');

		switch (event.key) {
			case this.key_bind.moveDown:

				if( current_pos.length ) {
		
					current_pos.next('[data-suggest]:visible').addClass("active").siblings().removeClass("active");

				} else {

					$('.'+this.box_class).find('[data-suggest]:visible').first().addClass('active');

				}				

			break;
			case this.key_bind.moveUp:

				if( current_pos.length ) {
						
					current_pos.prev('[data-suggest]:visible').addClass("active").siblings().removeClass("active");

				} else {

					$('.'+this.box_class).find('[data-suggest]:visible').last().addClass('active');

				}

			break;

		}

		return false;

	}

}
