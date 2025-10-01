const bg = document.getElementById('bg');
const bar = document.getElementById('bar');
const invGui = document.getElementById('inventory');
const moneyGui = document.getElementById('money');
let money = 0
let elements = {}
let oldX, oldY;
let current = 0
let required = 25000
fetch("./elements.json")
	.then((response) => response.json())
	.then((json) => elements = json)

function randomItem(category) {
	return {
		"element": Object.keys(elements[category])[Math.floor(Math.random() * Object.values(elements[category]).length)],
		"weight": (Math.random() * 3).toFixed(2)
	};
}

function random(float = 1) {
	let rand = Math.random() * 100
	if (rand <= 0.01 * float) return randomItem("secret")
	else if (rand <= 5 * float) return randomItem("legendary")
	else if (rand <= 17 * float) return randomItem("epic")
	else if (rand <= 50 * float) return randomItem("rare")
	else return randomItem("common")
}

function find(item) {
	for (const [category, child] of Object.entries(elements)) {
		if (item in child) {
			return {
				"rarity": category,
				"pricePerKg": child[item]
			}
		}
	}
	return null;
}

function giveItem() {
	let item = {}
	let got = random(quality / 100)
	item["name"] = got["element"]
	item["weight"] = got["weight"]
	item["rarity"] = find(got["element"])["rarity"]
	item["value"] = find(got["element"])["pricePerKg"] * item["weight"]
  item["active"] = false;
  item["favorite"] = false; 
	inventory.push(item)
	updateStats()
}
let inventory = []

function finish() {
	let result = document.getElementById('result')
	quality = 100 - y
	if (quality <= 10) result.textContent = "super bad"
	else if (quality <= 25) result.textContent = "bad"
	else if (quality <= 75) result.textContent = "good"
	else if (quality <= 95) result.textContent = "almost"
	else result.textContent = "perfect"
	document.addEventListener('mousemove', qte);
	document.getElementById('qte').style.display = "block";
}

function updateStats() {
	invGui.innerHTML = ''
	for (let i = 0; i < inventory.length; i++) {
		const tile = document.createElement("div")
		tile.classList.add("item", `${inventory[i]["name"]}`)
    if (inventory[i]["favorite"]){
      tile.classList.add("favorite")
    }
    if (inventory[i]["active"]){
      tile.classList.add("active")
    }
		tile.addEventListener('mouseup', (e) => {
			if (e.button == 0) {
				if (inventory[i]["favorite"]) {
					alert("cannot select favorited items")
					return
				}
				if (inventory[i]["active"]) {
          inventory[i]["active"] = false
					tile.classList.remove("active")
					return
				}
				const activeTile = document.querySelector('.active')
				if (activeItem()) {
          const active = activeItem()
          active["active"] = false
					activeTile.classList.remove('active')
				}
        inventory[i]["active"] = true
				tile.classList.add("active")
			}
			if (e.button == 2) {
				e.preventDefault()
				if (inventory[i]["favorite"]) {
          inventory[i]["favorite"] = false
					tile.classList.remove("favorite")
					return
				}
        inventory[i]["favorite"] = true
        inventory[i]["active"] = false
        tile.classList.remove("active")
				tile.classList.add("favorite")
			}
		});
		tile.innerHTML = `${inventory[i]["name"]}<br>
    <span class='${inventory[i]["rarity"]}'>${inventory[i]["rarity"]}</span>
    <br>${inventory[i]["weight"]}kg`
		invGui.appendChild(tile)
	}
	moneyGui.textContent = `Money: ${money}`
}

function activeItem() {
	const activeEl = document.querySelector('.item.active');
	if (!activeEl) return null;
	const items = Array.from(document.querySelectorAll('.item'));
	const index = items.indexOf(activeEl);
	return [inventory[index], index] || null;
}
window.activeItem = activeItem
let y = 98
let quality = 100 - y
let dy = 1
let interval = null
bg.addEventListener("mousedown", () => {
	interval = setInterval(() => {
		bar.style.display = "block"
		bar.style.top = `${y}%`
		if (y >= 98) dy = -dy
		if (y <= 0) dy = -dy
		if (dy > 20) dy = 20
		y += dy
	}, 1)
})
document.addEventListener("mouseup", () => {
	dy = 1
	if (interval) {
		clearInterval(interval)
		interval = null
		finish()
	}
	y = 98
	bar.style.display = "none"
	bar.style.top = "98%"
})

function qte(e) {
	required = 10000 + ((100 - quality) * 250)
	document.getElementById('qte').style.display = "block";
	if (current >= required) {
		document.removeEventListener('mousemove', qte)
		current = 0
		document.getElementById('progress').style.width = "0%";
		document.getElementById('qte').style.display = 'none';
		giveItem()
	}
	if (oldX && oldY) current += Math.hypot(e.clientX - oldX, e.clientY - oldY)
	document.getElementById('progress').style.width = `${current / required * 100}%`;
	oldX = e.clientX
	oldY = e.clientY
}
document.getElementById('sell-all').addEventListener("mouseup", () => {
	let sum = 0;
	let kept = [];
	for (let i = 0; i < inventory.length; i++) {
		const tile = invGui.children[i];
		if (inventory[i]["favorite"]) {
			kept.push(inventory[i]);
		} else {
			sum += inventory[i].value;
		}
	}
	inventory = kept;
	money += sum;
	money = parseFloat(money.toFixed(3));
	updateStats();
});
document.getElementById('sell-this').addEventListener("mouseup", () => {
	let equipped = activeItem()
	if (equipped) {
		money += equipped[0]["value"]
		inventory.splice(equipped[1], 1)
	} else {
		alert("no item equipped")
	}
	updateStats()
})
document.addEventListener("contextmenu", (e) => {e.preventDefault()})