var pages = {};

/**
 * @name	String: name of page
 * @prev	String: name of prev page
 * @nexts	Array of String: names of next pages
 * @image   String: Image URL
 * @text	String: Text URL
 */

function Page(name, prev, text, image) {
	this.name = name;
	this.prev = prev;

	if(text !== undefined) {
		this.text = text;
	} else {
		this.text = name+'/text.txt';
	}

	if(image !== undefined) {
		this.image = image;
	} else {
		this.image = name+'/background.jpg';
	}

	if(pages[this.name] !== undefined) {
		alert("Erreur: Une page a déjà ce nom (\""+this.name+"\").");
	}

	pages[this.name] = this;
}

// Création des pages
new Page("init", null);
new Page("police", "init");
new Page("indices", "init");
new Page("poursuite", "init");
new Page("poney", "police");
//new Page("???", "???", ["fin"]);

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
	$("#"+name).removeClass("hidden");
	$('#'+name+' .content').perfectScrollbar('update');

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
	var regex = /\{\{([A-Za-z0-9]+)\}\}(.*)/gi;
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

	var html = '';
	html += '<div id="'+name+'" class="container hidden page">';
		html += '<div class="wrapper">';
			html += '<div class="content">';
				html += '';
			html += '</div>';
		html += '</div>';
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
