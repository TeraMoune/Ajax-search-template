<div class="search-result-box">
	<div class="search-result">
		[item]
			[full-link]
				<span>
					<span>
						<span>{title}</span>
						[rating]
						<div class="rate">
							[rating-type-1]<div class="rate_stars">{rating}</div>[/rating-type-1]
							[rating-type-2]
							<div class="rate_like" title="Мне нравится">
								<svg class="icon icon-like"><use xlink:href="#icon-like"></use></svg>
								{rating}
							</div>
							[/rating-type-2]
							[rating-type-3]
							<div class="rate_like-dislike">
								{rating}
							</div>
							[/rating-type-3]
							[rating-type-4]
							<div class="rate_like-dislike">
								<span class="ratingtypeplusminus ratingplus">{likes}</span>
								<span class="ratingtypeplusminus ratingminus">{dislikes}</span>
							</div>
							[/rating-type-4]							
						</div>
						[/rating]
					</span>
				</span>
			[/full-link]
		[/item]
		[notfound]<span class="notfound">{notfound}</span>[/notfound]
	</div>
	<div class="menu-search">
	{search-link}
	[last_viewed]
		{last_viewed}
	[/last_viewed]
	</div>
	<script>
	function changeSearch(obj) {
			
		if( $(obj).prop('checked') ) {
				
			setcookie('search_last_viewed', 1);
			dle_do_search(dle_search_value);
				
		} else {
				
			setcookie('search_last_viewed', 0);
			dle_do_search(dle_search_value);
				
		}
		
		$('#story').focus();
	}
	$(function(){
		if( $('.search-result a').length ) setTimeout(function(){ $('.search-result a').addClass('visible') }, 300);
	});
	</script>
</div>
