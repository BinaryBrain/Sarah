var pages = {};

/**
 * @name	String: name of page
 * @prev	String: name of prev page
 * @nexts	Array of String: names of next pages
 * @image   String: Image URL
 * @text	String: Text URL
 */

function Page(name, text, image, music, sound) {
	this.name = name;

	if(text !== undefined) {
		this.text = text+'.txt';
	} else {
		this.text = name+'/text.txt';
	}

	if(image !== undefined) {
		this.image = image+'.jpg';
	} else {
		this.image = name+'/background.jpg';
	}

	if(music !== undefined) {
		this.music = { mp3: music+'.mp3', ogg: music+'.ogg' };
	} else {
		this.music = { mp3: name+'/music.mp3', ogg: name+'/music.ogg' };
	}

	if(sound !== undefined) {
		this.sound = { mp3: sound+'.mp3', ogg: sound+'.ogg' };
	} else {
		this.sound = { mp3: name+'/sound.mp3', ogg: name+'/sound.ogg' };
	}

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
	$('.page').addClass("hidden");
	$('.page .music, .page .sound').get().map(function (e) {
		e.pause();
	});

	$("#"+name).removeClass("hidden");
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
	var regex = /\{\{([A-Za-z0-9]+)\}\}\s*(.*)/gi;
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

		html += '<audio class="music" loop preload="auto">';
			html += '<source src="pages/'+music.ogg+'" type="audio/ogg"><source src="pages/'+music.mp3+'" type="audio/mpeg">';
		html += '</audio>';
		html += '<audio class="sound" preload="auto">';
			html += '<source src="pages/'+sound.ogg+'" type="audio/ogg"><source src="pages/'+sound.mp3+'" type="audio/mpeg">';
		html += '</audio>';
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
		createPage(nexts[i]);
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
		
		history.pushState({ page: choice }, choice, "#"+choice);

		display(choice);
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
