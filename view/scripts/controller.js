var pages = {};
var images = {};

/**
 * @name	String: name of page
 * @prev	String: name of prev page
 * @nexts	Array of String: names of next pages
 * @image   String: Image URL
 * @text	String: ???
 */

function Page(name, prev, nexts, text, image) {
	this.name = name;
	this.prev = prev;
	this.nexts = nexts;
	this.text = text;

	if(image !== undefined) {
		this.image = image;
	} else {
		this.image = pages[this.prev].image;
	}

	if(pages[this.name] !== undefined) {
		alert("Erreur: Une page a déjà ce nom (\""+this.name+"\").");
	}

	pages[this.name] = this;
}

// Création des pages
new Page("init", null, ["police", "indices", "poursuite"]);
new Page("police", "init", []);
new Page("indices", "init", []);
new Page("poursuite", "init", []);

function init() {
	if (pages.init === undefined) {
		alert("Erreur: page init introuvable");
		return;
	}
}

$(function () {
	init();
});
