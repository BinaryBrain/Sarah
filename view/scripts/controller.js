var pages = {};

/**
 * @name	String: name of page
 * @prev	String: name of prev page
 * @nexts	Array of String: names of next pages
 * @image   String: Image URL
 * @text	String: Text URL
 */

function Page(name, sameMusic, sameSound) {
	this.name = name;

	this.sameMusic = (sameMusic !== undefined) ? sameMusic : false;
	this.sameSound = (sameSound !== undefined) ? sameSound : false;
	
	this.text = name+'/text.txt';
	this.image = name+'/background.png';
	this.music = { mp3: name+'/music.mp3', ogg: name+'/music.ogg' };
	this.sound = { mp3: name+'/sound.mp3', ogg: name+'/sound.ogg' };
	
	if(pages[this.name] !== undefined) {
		alert("Erreur: Une page a déjà ce nom (\""+this.name+"\").");
	}

	pages[this.name] = this;
}

// Création des pages
new Page("baiser");
new Page("colline");
new Page("croire");
new Page("indices");
new Page("init");
new Page("legume");
new Page("parents");
new Page("police");
new Page("suicide", true);

function init(page) {
	if (pages.init === undefined) {
		alert("Erreur: page \""+page+"\" introuvable");
		return;
	}

	deleteOldPages();
	createPage(page, function () {
		display(page);
	});

	history.pushState({ page: page }, page, '#'+page);
}

// Display a page
function display(name) {
	$("#"+name).removeClass("hidden");
	$('.page:not(#'+name+')').remove();
	
	if(!pages[name].sameMusic) {
		$('.page .music').get().map(function (e) {
			e.pause();
		});
	}

	if(!pages[name].sameSound) {
		$('.page .sound').get().map(function (e) {
			e.pause();
		});
	}

	$('#'+name+' .wrapper').hide();

	setTimeout(function() {
		$('#'+name+' .wrapper').fadeIn(1000);
		$('footer').animate({ 'bottom': "0px" }, 1000);
	}, 1000);


	$('#'+name+' .content').perfectScrollbar('update');
	$('#'+name+' .music, #'+name+' .sound').get().map(function (e) {
		e.play();
	});

	if(pages[name].nexts) {
		loadFuturePages(pages[name].nexts);
	}
}

function addLineBreak(text) {
	var htmls = [];
	var lines = text.split(/\n/);

	var tmpDiv = $(document.createElement('div'));
	for (var i = 0 ; i < lines.length ; i++) {
		htmls.push(tmpDiv.text(lines[i]).html());
	}
	return htmls.join("<br>");
}

function parseText(str) {
	var regex = /\{\{([A-Za-z0-9]+)\}\}\s*\[\[(.*?)\]\]/gi;
	return str.replace(regex, '<div class="choice" data-choice="$1">$2</div>');
}

function getNexts(str) {
	var regex2 = /\{\{([A-Za-z0-9]+)\}\}/gi;
	var nexts = str.match(regex2);

	if(nexts) {
		return nexts.map(function (e) {
			return e.substring(2, e.length-2);
		});
	} else {
		return null;
	}
}

function createPage(name, cb) {
	var page = pages[name];
	var text = page.text;
	var image = page.image;
	var music = page.music;
	var sound = page.sound;

	var html = '';
	html += '<div id="'+name+'" class="container hidden page">';
		html += '<div class="wrapper">';
			html += '<div class="content"></div>';
		html += '</div>';

		if(!page.sameMusic) {
			html += '<audio class="music" loop preload="auto">';
				html += '<source src="pages/'+music.ogg+'" type="audio/ogg"><source src="pages/'+music.mp3+'" type="audio/mpeg">';
			html += '</audio>';
		}
		if(!page.sameSound) {
			html += '<audio class="sound" preload="auto">';
				html += '<source src="pages/'+sound.ogg+'" type="audio/ogg"><source src="pages/'+sound.mp3+'" type="audio/mpeg">';
			html += '</audio>';
		}
	html += '</div>';

	$("body").append(html);

	$.get('pages/'+text, function (data) {
		page.nexts = getNexts(data);

		$('#'+name+' .content').html(parseText(addLineBreak(data)));
		$('#'+name+' .content').perfectScrollbar({ suppressScrollX: true });

		if(cb) {
			cb();
		}
	})

	$('#'+name).css({ 'background-image': 'url(pages/'+image+')' });
}

function loadFuturePages(nexts) {
	for (var i = nexts.length - 1; i >= 0; i--) {
		if($("#"+nexts[i]).length === 0) {
			createPage(nexts[i]);
		}
	}
}

function deleteOldPages() {
	$(".container").remove();
}

$(function () {
	var anchor = window.location.hash.substring(1);
	if(anchor === "") {
		anchor = "init";
	}

	init(anchor);
	
	$('body').on('click', '.choice', function() {
		var choice = $(this).attr('data-choice');
		if(pages[choice] === undefined) {
			alert('Erreur: Page introuvable ("'+choice+'").');
		}

		$('footer').animate({ 'bottom': "-30px" }, 1000);
		$('.container:not(.hidden) .wrapper').fadeOut(1000, function () {
			display(choice);
		});

		history.pushState({ page: choice }, choice, "#"+choice);
	});

	window.onpopstate = function(e) {
		var page;

		if(!e.state || e.state.page === undefined) {
			var anchor = window.location.hash.substring(1);
			if(anchor === "") {
				anchor = "init";
			}

			page = anchor
		} else {
			page = e.state.page;
		}

		deleteOldPages();
		createPage(page, function () {
			display(page);
		})
	};
});
