(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function n(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(a){if(a.ep)return;a.ep=!0;const s=n(a);fetch(a.href,s)}})();const Ft=[{id:8,name:"6e Klasse",minAttr:5,maxAttr:35,avgAttr:20,budget:5e3,salary:{min:0,avg:50,max:200},ticketPrice:4},{id:7,name:"5e Klasse",minAttr:10,maxAttr:45,avgAttr:28,budget:15e3,salary:{min:25,avg:100,max:400},ticketPrice:5},{id:6,name:"4e Klasse",minAttr:15,maxAttr:55,avgAttr:35,budget:4e4,salary:{min:50,avg:200,max:800},ticketPrice:7},{id:5,name:"3e Klasse",minAttr:20,maxAttr:65,avgAttr:43,budget:1e5,salary:{min:100,avg:400,max:1500},ticketPrice:10},{id:4,name:"2e Klasse",minAttr:30,maxAttr:75,avgAttr:52,budget:3e5,salary:{min:200,avg:800,max:3e3},ticketPrice:12},{id:3,name:"1e Klasse",minAttr:40,maxAttr:82,avgAttr:61,budget:1e6,salary:{min:500,avg:2e3,max:7500},ticketPrice:15},{id:2,name:"Tweede Divisie",minAttr:50,maxAttr:88,avgAttr:69,budget:5e6,salary:{min:2e3,avg:7500,max:25e3},ticketPrice:22},{id:1,name:"Eerste Divisie",minAttr:60,maxAttr:93,avgAttr:76,budget:2e7,salary:{min:7500,avg:25e3,max:1e5},ticketPrice:32},{id:0,name:"Eredivisie",minAttr:70,maxAttr:99,avgAttr:84,budget:1e8,salary:{min:25e3,avg:1e5,max:5e5},ticketPrice:50}],te=[{code:"NL",name:"Nederlands",flag:"🇳🇱",bonus:{VER:3,passing:5}},{code:"BE",name:"Belgisch",flag:"🇧🇪",bonus:{AAN:4,FYS:4}},{code:"DE",name:"Duits",flag:"🇩🇪",bonus:{FYS:5,discipline:3}},{code:"BR",name:"Braziliaans",flag:"🇧🇷",bonus:{SNE:7,VER:-2}},{code:"AR",name:"Argentijns",flag:"🇦🇷",bonus:{AAN:5,passion:3}},{code:"ES",name:"Spaans",flag:"🇪🇸",bonus:{AAN:5,passing:5}},{code:"GB",name:"Engels",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",bonus:{FYS:5,heading:3}},{code:"FR",name:"Frans",flag:"🇫🇷",bonus:{SNE:5,AAN:3}},{code:"PT",name:"Portugees",flag:"🇵🇹",bonus:{SNE:5,dribbling:3}},{code:"IT",name:"Italiaans",flag:"🇮🇹",bonus:{VER:5,tactical:3}},{code:"PL",name:"Pools",flag:"🇵🇱",bonus:{FYS:4,VER:3}},{code:"HR",name:"Kroatisch",flag:"🇭🇷",bonus:{AAN:5,VER:2}},{code:"RS",name:"Servisch",flag:"🇷🇸",bonus:{FYS:4,AAN:3}},{code:"DK",name:"Deens",flag:"🇩🇰",bonus:{FYS:4,teamwork:3}},{code:"SE",name:"Zweeds",flag:"🇸🇪",bonus:{FYS:5,SNE:2}},{code:"NO",name:"Noors",flag:"🇳🇴",bonus:{FYS:5,stamina:3}},{code:"GH",name:"Ghanees",flag:"🇬🇭",bonus:{SNE:5,FYS:3}},{code:"NG",name:"Nigeriaans",flag:"🇳🇬",bonus:{SNE:5,AAN:3}},{code:"CM",name:"Kameroens",flag:"🇨🇲",bonus:{FYS:5,SNE:3}},{code:"MA",name:"Marokkaans",flag:"🇲🇦",bonus:{SNE:5,AAN:3}},{code:"TR",name:"Turks",flag:"🇹🇷",bonus:{passion:5,AAN:3}},{code:"JP",name:"Japans",flag:"🇯🇵",bonus:{SNE:5,discipline:5}},{code:"KR",name:"Zuid-Koreaans",flag:"🇰🇷",bonus:{stamina:5,discipline:3}},{code:"US",name:"Amerikaans",flag:"🇺🇸",bonus:{FYS:4,SNE:3}}],S={keeper:{name:"Keeper",abbr:"KEE",color:"#f9a825",group:"goalkeeper",weights:{REF:.45,BAL:.3,SNE:.15,FYS:.1}},linksback:{name:"Linksback",abbr:"LB",color:"#2196f3",group:"defender",weights:{VER:.35,SNE:.3,FYS:.25,AAN:.1}},centraleVerdediger:{name:"Centrale Verdediger",abbr:"CV",color:"#1976d2",group:"defender",weights:{VER:.45,FYS:.35,SNE:.15,AAN:.05}},rechtsback:{name:"Rechtsback",abbr:"RB",color:"#2196f3",group:"defender",weights:{VER:.35,SNE:.3,FYS:.25,AAN:.1}},linksMid:{name:"Links Middenvelder",abbr:"LM",color:"#4caf50",group:"midfielder",weights:{SNE:.3,AAN:.3,VER:.2,FYS:.2}},centraleMid:{name:"Centrale Middenvelder",abbr:"CM",color:"#4caf50",group:"midfielder",weights:{VER:.3,AAN:.3,FYS:.2,SNE:.2}},rechtsMid:{name:"Rechts Middenvelder",abbr:"RM",color:"#4caf50",group:"midfielder",weights:{SNE:.3,AAN:.3,VER:.2,FYS:.2}},linksbuiten:{name:"Linksbuiten",abbr:"LW",color:"#9c27b0",group:"attacker",weights:{SNE:.35,AAN:.35,FYS:.15,VER:.15}},rechtsbuiten:{name:"Rechtsbuiten",abbr:"RW",color:"#9c27b0",group:"attacker",weights:{SNE:.35,AAN:.35,FYS:.15,VER:.15}},spits:{name:"Spits",abbr:"ST",color:"#9c27b0",group:"attacker",weights:{AAN:.45,SNE:.25,FYS:.2,VER:.1}}},ot={keeper:{REF:{name:"Katachtige Keeper",bonus:{reflexes:15,diving:10}},BAL:{name:"Veilige Keeper",bonus:{catching:12,positioning:8}},SNE:{name:"Sweeper-Keeper",bonus:{saves_outside:10,rushing:8}},FYS:{name:"Kolos-Keeper",bonus:{aerial:15,intimidation:10}}},linksback:{SNE:{name:"Snelle Back",bonus:{pace:12,crossing:8}},VER:{name:"Defensieve Back",bonus:{tackling:10,positioning:8}},AAN:{name:"Aanvallende Back",bonus:{crossing:12,assists:10}},FYS:{name:"Fysieke Back",bonus:{stamina:10,strength:8}}},centraleVerdediger:{FYS:{name:"Kolos",bonus:{heading:15,tackling:10}},VER:{name:"Muur",bonus:{positioning:12,tackling:8}},SNE:{name:"Snelle Verdediger",bonus:{pace:10,interception:8}},AAN:{name:"Opbouwende Verdediger",bonus:{passing:12,longballs:8}}},rechtsback:{SNE:{name:"Snelle Back",bonus:{pace:12,crossing:8}},VER:{name:"Defensieve Back",bonus:{tackling:10,positioning:8}},AAN:{name:"Aanvallende Back",bonus:{crossing:12,assists:10}},FYS:{name:"Fysieke Back",bonus:{stamina:10,strength:8}}},linksMid:{SNE:{name:"Snelle Vleugelspeler",bonus:{pace:12,dribbling:8}},VER:{name:"Verdedigende Vleugelspeler",bonus:{tackling:10,positioning:8}},AAN:{name:"Aanvallende Vleugelspeler",bonus:{assists:12,crossing:10}},FYS:{name:"Fysieke Vleugelspeler",bonus:{stamina:12,strength:8}}},centraleMid:{VER:{name:"Destroyer",bonus:{interception:15,tackling:10}},FYS:{name:"Box-to-Box",bonus:{stamina:10,allround:8}},SNE:{name:"Dynamische Middenvelder",bonus:{dribbling:10,pressing:8}},AAN:{name:"Aanvallende Middenvelder",bonus:{shooting:12,positioning:8}}},rechtsMid:{SNE:{name:"Snelle Vleugelspeler",bonus:{pace:12,dribbling:8}},VER:{name:"Verdedigende Vleugelspeler",bonus:{tackling:10,positioning:8}},AAN:{name:"Aanvallende Vleugelspeler",bonus:{assists:12,crossing:10}},FYS:{name:"Fysieke Vleugelspeler",bonus:{stamina:12,strength:8}}},linksbuiten:{SNE:{name:"Snelle Vleugelspits",bonus:{pace:15,counter:10}},AAN:{name:"Doelgerichte Buitenspeler",bonus:{finishing:12,cutting_inside:8}},FYS:{name:"Fysieke Buitenspeler",bonus:{strength:10,heading:8}},VER:{name:"Hardwerkende Buitenspeler",bonus:{pressing:10,tackling:6}}},rechtsbuiten:{SNE:{name:"Snelle Vleugelspits",bonus:{pace:15,counter:10}},AAN:{name:"Doelgerichte Buitenspeler",bonus:{finishing:12,cutting_inside:8}},FYS:{name:"Fysieke Buitenspeler",bonus:{strength:10,heading:8}},VER:{name:"Hardwerkende Buitenspeler",bonus:{pressing:10,tackling:6}}},spits:{FYS:{name:"Bonkige Spits",bonus:{heading:15,holdup:12}},SNE:{name:"Snelle Spits",bonus:{counter:15,pace:10}},AAN:{name:"Doelpuntenmachine",bonus:{finishing:18,positioning:5}},VER:{name:"Hardwerkende Spits",bonus:{pressing:12,holdup:8}}}},Q={good:["Leider","Professional","Loyaal","Mentor","Perfectionist"],neutral:["Ambitieus","Verlegen","Einzelganger"],bad:["Feestbeest","Lui","Arrogant","Temperamentvol","Geldwolf"]},Ae=["Jan","Pieter","Henk","Klaas","Willem","Sander","Thijs","Daan","Lars","Jesse","Joris","Bram","Niels","Jeroen","Martijn","Kevin","Stefan","Dennis","Tim","Bas","Rick","Robin","Mark","Erik","Ruben","Tom","Mike","Jens","Frank","Wouter","Mohammed","Ahmed","Youssef","Ibrahim","Omar","Lucas","Noah","Finn","Sem","Levi"],Ie=["de Jong","Jansen","de Vries","van den Berg","Bakker","Visser","Smit","Meijer","de Boer","Mulder","de Groot","Bos","Vos","Peters","Hendriks","van Dijk","Vermeer","Dekker","Brouwer","de Wit","Dijkstra","Koster","Willems","van Leeuwen","El Amrani","Özdemir","Silva","Santos","Garcia","Martinez","Andersen","Nielsen"],Je={mentality:[{id:"defensive",name:"Verdedigend",icon:"🛡️",effect:{defense:15,attack:-10}},{id:"balanced",name:"Gebalanceerd",icon:"⚖️",effect:{defense:0,attack:0}},{id:"attacking",name:"Aanvallend",icon:"⚔️",effect:{defense:-10,attack:15}},{id:"ultra_attacking",name:"Ultra Aanvallend",icon:"🔥",effect:{defense:-20,attack:25}}],pressing:[{id:"low",name:"Laag Blok",icon:"📉",effect:{stamina:10,pressing:-15}},{id:"medium",name:"Medium Druk",icon:"📊",effect:{stamina:0,pressing:0}},{id:"high",name:"Hoge Druk",icon:"📈",effect:{stamina:-15,pressing:20}},{id:"gegenpressing",name:"Gegenpressing",icon:"⚡",effect:{stamina:-25,pressing:30,recovery:20}}]},Be={fysio:{name:"Fysiotherapeut",icon:"🏥",description:"Versnelt herstel van blessures",effect:"Herstel -25%",minDivision:5,cost:500,weeklySalary:150},scout:{name:"Talentscout",icon:"🔭",description:"Verhoogt kans op succesvolle scouts",effect:"Scout +15%",minDivision:5,cost:750,weeklySalary:200},dokter:{name:"Clubarts",icon:"👨‍⚕️",description:"Vermindert kans op blessures",effect:"Blessure -20%",minDivision:5,cost:1e3,weeklySalary:250}},rt={attacking:{name:"Aanvallende Assistent",icon:"⚔️",description:"Specialist in aanvallend spel",effect:"+20% AAN training",boostStats:["AAN"],boostAmount:.2,cost:300,weeklySalary:100},defensive:{name:"Verdedigende Assistent",icon:"🛡️",description:"Specialist in verdedigend spel",effect:"+20% VER training",boostStats:["VER"],boostAmount:.2,cost:300,weeklySalary:100},technical:{name:"Aanvalsassistent",icon:"⚽",description:"Verbetert aanvallend inzicht",effect:"+20% AAN training",boostStats:["AAN"],boostAmount:.2,cost:400,weeklySalary:120},physical:{name:"Conditietrainer",icon:"💪",description:"Focust op fysieke ontwikkeling",effect:"+15% SNE & FYS training",boostStats:["SNE","FYS"],boostAmount:.15,cost:350,weeklySalary:110}},K={"4-4-2":{name:"4-4-2 Klassiek",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:15,y:48,role:"linksbuiten",name:"LW"},{x:38,y:52,role:"centraleMid",name:"CM"},{x:62,y:52,role:"centraleMid",name:"CM"},{x:85,y:48,role:"rechtsbuiten",name:"RW"},{x:35,y:24,role:"spits",name:"ST"},{x:65,y:24,role:"spits",name:"ST"}],idealTags:["Box-to-Box","Snelle Vleugelspits","Doelpuntenmachine","Bonkige Spits"]},"4-3-3":{name:"4-3-3 Aanvallend",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:30,y:52,role:"centraleMid",name:"CM"},{x:50,y:48,role:"centraleMid",name:"CM"},{x:70,y:52,role:"centraleMid",name:"CM"},{x:18,y:26,role:"linksbuiten",name:"LW"},{x:50,y:18,role:"spits",name:"ST"},{x:82,y:26,role:"rechtsbuiten",name:"RW"}],idealTags:["Spelmaker","Destroyer","Snelle Vleugelspits","Doelpuntenmachine"]},"4-2-3-1":{name:"4-2-3-1",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:35,y:56,role:"centraleMid",name:"CM"},{x:65,y:56,role:"centraleMid",name:"CM"},{x:18,y:36,role:"linksbuiten",name:"LW"},{x:50,y:32,role:"centraleMid",name:"CM"},{x:82,y:36,role:"rechtsbuiten",name:"RW"},{x:50,y:16,role:"spits",name:"ST"}],idealTags:["Destroyer","Spelmaker","Technische Buitenspeler","Doelpuntenmachine"]},"3-5-2":{name:"3-5-2 Wingbacks",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:30,y:76,role:"centraleVerdediger",name:"CV"},{x:50,y:78,role:"centraleVerdediger",name:"CV"},{x:70,y:76,role:"centraleVerdediger",name:"CV"},{x:8,y:50,role:"linksback",name:"LB"},{x:30,y:52,role:"centraleMid",name:"CM"},{x:50,y:48,role:"centraleMid",name:"CM"},{x:70,y:52,role:"centraleMid",name:"CM"},{x:92,y:50,role:"rechtsback",name:"RB"},{x:35,y:22,role:"spits",name:"ST"},{x:65,y:22,role:"spits",name:"ST"}],idealTags:["Kolos","Aanvallende Back","Box-to-Box","Bonkige Spits"]},"5-3-2":{name:"5-3-2 Verdedigend",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:10,y:68,role:"linksback",name:"LB"},{x:30,y:76,role:"centraleVerdediger",name:"CV"},{x:50,y:78,role:"centraleVerdediger",name:"CV"},{x:70,y:76,role:"centraleVerdediger",name:"CV"},{x:90,y:68,role:"rechtsback",name:"RB"},{x:30,y:48,role:"centraleMid",name:"CM"},{x:50,y:52,role:"centraleMid",name:"CM"},{x:70,y:48,role:"centraleMid",name:"CM"},{x:35,y:22,role:"spits",name:"ST"},{x:65,y:22,role:"spits",name:"ST"}],idealTags:["Muur","Kolos","Destroyer","Bonkige Spits"]},"4-1-4-1":{name:"4-1-4-1 Holding",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:50,y:58,role:"centraleMid",name:"CM"},{x:15,y:40,role:"linksbuiten",name:"LW"},{x:38,y:44,role:"centraleMid",name:"CM"},{x:62,y:44,role:"centraleMid",name:"CM"},{x:85,y:40,role:"rechtsbuiten",name:"RW"},{x:50,y:18,role:"spits",name:"ST"}],idealTags:["Destroyer","Spelmaker","Snelle Vleugelspits","Doelpuntenmachine"]},"3-4-3":{name:"3-4-3 Totaal Voetbal",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:30,y:74,role:"centraleVerdediger",name:"CV"},{x:50,y:76,role:"centraleVerdediger",name:"CV"},{x:70,y:74,role:"centraleVerdediger",name:"CV"},{x:10,y:48,role:"linksback",name:"LB"},{x:38,y:52,role:"centraleMid",name:"CM"},{x:62,y:52,role:"centraleMid",name:"CM"},{x:90,y:48,role:"rechtsback",name:"RB"},{x:22,y:22,role:"linksbuiten",name:"LW"},{x:50,y:18,role:"spits",name:"ST"},{x:78,y:22,role:"rechtsbuiten",name:"RW"}],idealTags:["Elegante Verdediger","Aanvallende Back","Spelmaker","Snelle Vleugelspits"]},"4-4-2-diamond":{name:"4-4-2 Diamant",positions:[{x:50,y:92,role:"keeper",name:"KEE"},{x:15,y:72,role:"linksback",name:"LB"},{x:38,y:76,role:"centraleVerdediger",name:"CV"},{x:62,y:76,role:"centraleVerdediger",name:"CV"},{x:85,y:72,role:"rechtsback",name:"RB"},{x:50,y:58,role:"centraleMid",name:"CM"},{x:28,y:44,role:"centraleMid",name:"CM"},{x:72,y:44,role:"centraleMid",name:"CM"},{x:50,y:32,role:"centraleMid",name:"CM"},{x:35,y:18,role:"spits",name:"ST"},{x:65,y:18,role:"spits",name:"ST"}],idealTags:["Destroyer","Box-to-Box","Spelmaker","Technische Spits"]}},Y={tribunes:[{id:"tribune_1",name:"Houten Bankjes",capacity:200,cost:0,buildTime:0,maintenance:10,required:0},{id:"tribune_2",name:"Betonnen Tribune",capacity:500,cost:15e3,buildTime:7,maintenance:25,required:0},{id:"tribune_3",name:"Tribune met Dak",capacity:1e3,cost:35e3,buildTime:14,maintenance:50,required:500},{id:"tribune_4",name:"Overdekte Tribune",capacity:2e3,cost:1e5,buildTime:21,maintenance:100,required:1e3},{id:"tribune_5",name:"Dubbele Tribune",capacity:4e3,cost:25e4,buildTime:30,maintenance:200,required:2e3},{id:"tribune_6",name:"Hoefijzer Stadion",capacity:6e3,cost:45e4,buildTime:45,maintenance:350,required:4e3},{id:"tribune_7",name:"Modern Stadion",capacity:1e4,cost:8e5,buildTime:60,maintenance:500,required:6e3},{id:"tribune_8",name:"Professioneel Stadion",capacity:18e3,cost:2e6,buildTime:90,maintenance:900,required:1e4},{id:"tribune_9",name:"Groot Stadion",capacity:3e4,cost:5e6,buildTime:120,maintenance:1500,required:18e3},{id:"tribune_10",name:"Arena",capacity:45e3,cost:12e6,buildTime:180,maintenance:3e3,required:3e4},{id:"tribune_11",name:"Super Arena",capacity:55e3,cost:25e6,buildTime:240,maintenance:5e3,required:45e3},{id:"tribune_12",name:"Nationaal Stadion",capacity:7e4,cost:5e7,buildTime:365,maintenance:8e3,required:55e3}],grass:[{id:"grass_0",name:"Basis Grasveld",effect:"Standaard veldslijtage",cost:0,buildTime:0,required:0},{id:"grass_1",name:"Onderhouden Gras",effect:"-20% veldslijtage",cost:5e3,buildTime:3,required:0},{id:"grass_2",name:"Semi-Pro Gras",effect:"-40% veldslijtage, +5% passing",cost:2e4,buildTime:7,required:1e3},{id:"grass_3",name:"Professioneel Gras",effect:"-60% veldslijtage, +10% passing",cost:75e3,buildTime:14,required:4e3},{id:"grass_4",name:"Hybride Gras",effect:"-80% veldslijtage, +15% passing",cost:2e5,buildTime:21,required:1e4},{id:"grass_5",name:"Stadium Turf",effect:"Geen slijtage, +20% passing",cost:5e5,buildTime:30,required:25e3}],horeca:[{id:"horeca_1",name:"Koffiekar",income:.2,cost:1e3,buildTime:1,required:0},{id:"horeca_2",name:"Frietkraam",income:.5,cost:5e3,buildTime:3,required:0},{id:"horeca_3",name:"Drankstand",income:.4,cost:3e3,buildTime:2,required:0},{id:"horeca_4",name:"Bierkraam",income:.8,cost:8e3,buildTime:5,required:500},{id:"horeca_5",name:"Snackbar",income:1.2,cost:15e3,buildTime:7,required:500},{id:"horeca_6",name:"Hamburger Stand",income:1,cost:12e3,buildTime:5,required:1e3},{id:"horeca_7",name:"Pizza Corner",income:1.3,cost:18e3,buildTime:7,required:2e3},{id:"horeca_8",name:"Restaurant Basis",income:2.5,cost:5e4,buildTime:14,required:2e3},{id:"horeca_9",name:"Food Court",income:3,cost:15e4,buildTime:21,required:6e3},{id:"horeca_10",name:"Premium Restaurant",income:5,cost:3e5,buildTime:30,required:1e4},{id:"horeca_11",name:"Michelin Restaurant",income:8,cost:75e4,buildTime:45,required:3e4},{id:"horeca_12",name:"Hospitality Village",income:12,cost:15e5,buildTime:60,required:45e3}],fanshop:[{id:"shop_1",name:"Verkooptafel",income:.2,cost:1e3,buildTime:1,required:0},{id:"shop_2",name:"Merchandise Kraam",income:.3,cost:2e3,buildTime:1,required:0},{id:"shop_3",name:"Kleine Fanshop",income:.8,cost:1e4,buildTime:5,required:500},{id:"shop_4",name:"Fanshop Standaard",income:1.5,cost:35e3,buildTime:10,required:2e3},{id:"shop_5",name:"Grote Fanshop",income:2.5,cost:1e5,buildTime:20,required:6e3},{id:"shop_6",name:"Megastore",income:4,cost:3e5,buildTime:35,required:18e3},{id:"shop_7",name:"Flagship Store",income:6,cost:75e4,buildTime:45,required:3e4},{id:"shop_8",name:"Online Shop",dailyIncome:500,cost:5e4,buildTime:7,required:2e3},{id:"shop_9",name:"Webshop Premium",dailyIncome:2e3,cost:2e5,buildTime:14,required:1e4},{id:"shop_10",name:"E-Commerce Platform",dailyIncome:8e3,cost:8e5,buildTime:30,required:3e4}],vip:[{id:"vip_1",name:"Business Seats",capacity:30,pricePerSeat:20,cost:5e4,buildTime:14,required:2e3},{id:"vip_2",name:"Business Seats+",capacity:60,pricePerSeat:25,cost:1e5,buildTime:21,required:4e3},{id:"vip_3",name:"Skybox Klein",capacity:15,pricePerSeat:60,cost:15e4,buildTime:21,required:6e3},{id:"vip_4",name:"Skybox Standaard",capacity:30,pricePerSeat:75,cost:3e5,buildTime:30,required:1e4},{id:"vip_5",name:"Skybox Premium",capacity:50,pricePerSeat:100,cost:5e5,buildTime:35,required:18e3},{id:"vip_6",name:"Executive Lounge",capacity:80,pricePerSeat:125,cost:8e5,buildTime:45,required:25e3},{id:"vip_7",name:"VIP Village",capacity:150,pricePerSeat:175,cost:15e5,buildTime:60,required:35e3},{id:"vip_8",name:"Platinum Lounge",capacity:200,pricePerSeat:250,cost:3e6,buildTime:75,required:45e3},{id:"vip_9",name:"Directors Box",capacity:50,pricePerSeat:500,cost:5e6,buildTime:90,required:55e3}],parking:[{id:"parking_1",name:"Grasveld",capacity:50,pricePerCar:1,cost:2e3,buildTime:2,required:0},{id:"parking_2",name:"Gravel Parkeren",capacity:100,pricePerCar:2,cost:1e4,buildTime:5,required:500},{id:"parking_3",name:"Verhard Terrein",capacity:200,pricePerCar:3,cost:25e3,buildTime:10,required:1e3},{id:"parking_4",name:"Parkeerplaats Klein",capacity:400,pricePerCar:4,cost:75e3,buildTime:20,required:4e3},{id:"parking_5",name:"Parkeerplaats Groot",capacity:800,pricePerCar:5,cost:2e5,buildTime:30,required:1e4},{id:"parking_6",name:"Parkeergarage",capacity:1500,pricePerCar:7,cost:5e5,buildTime:60,required:2e4},{id:"parking_7",name:"Multi-Parkeergarage",capacity:3e3,pricePerCar:8,cost:12e5,buildTime:90,required:35e3},{id:"parking_8",name:"VIP Parking",capacity:200,pricePerCar:25,cost:4e5,buildTime:30,required:2e4}],lighting:[{id:"light_1",name:"Bouwlampen",effect:"avond",cost:1e4,buildTime:3,required:500},{id:"light_2",name:"Basis Verlichting",effect:"avond+",cost:3e4,buildTime:14,required:1e3},{id:"light_3",name:"Lichtmasten",effect:"+10% sfeer",cost:8e4,buildTime:21,required:4e3},{id:"light_4",name:"Pro Verlichting",effect:"+15% sfeer, TV",cost:2e5,buildTime:30,required:1e4},{id:"light_5",name:"Stadion Verlichting",effect:"+20% sfeer, HD",cost:5e5,buildTime:45,required:25e3},{id:"light_6",name:"LED Systeem",effect:"+25% sfeer, 4K, -30% energie",cost:1e6,buildTime:60,required:4e4}],training:[{id:"train_1",name:"Grasveld",multiplier:1,maxAttr:50,cost:0,buildTime:0,required:0},{id:"train_2",name:"Amateur Veld",multiplier:1.2,maxAttr:60,cost:25e3,buildTime:14,required:0},{id:"train_3",name:"Semi-Pro Complex",multiplier:1.4,maxAttr:70,cost:75e3,buildTime:21,required:1e3},{id:"train_4",name:"Professioneel Complex",multiplier:1.6,maxAttr:80,cost:2e5,buildTime:30,required:4e3},{id:"train_5",name:"Elite Complex",multiplier:1.8,maxAttr:90,cost:5e5,buildTime:45,required:1e4},{id:"train_6",name:"Wereldklasse Complex",multiplier:2,maxAttr:99,cost:1e6,buildTime:60,required:25e3}],medical:[{id:"med_1",name:"Geen",effect:"+50% blessureduur",cost:0,buildTime:0,required:0},{id:"med_2",name:"EHBO Post",effect:"standaard",cost:1e4,buildTime:3,required:0},{id:"med_3",name:"Fysiotherapeut",effect:"-15% blessureduur",cost:35e3,buildTime:7,required:500},{id:"med_4",name:"Medische Kamer",effect:"-25% blessureduur",cost:1e5,buildTime:14,required:2e3},{id:"med_5",name:"Medisch Centrum",effect:"-35% duur, -10% kans",cost:3e5,buildTime:21,required:6e3},{id:"med_6",name:"Elite Faciliteit",effect:"-50% duur, -20% kans",cost:75e4,buildTime:30,required:18e3},{id:"med_7",name:"Sportmedisch Instituut",effect:"-60% duur, -30% kans",cost:15e5,buildTime:45,required:35e3}],academy:[{id:"acad_1",name:"Geen",youthPerMonth:0,maxOverall:0,cost:0,buildTime:0,required:0},{id:"acad_2",name:"Jeugdteam",youthPerMonth:.5,maxOverall:40,cost:25e3,buildTime:14,required:500},{id:"acad_3",name:"Basis Academie",youthPerMonth:1,maxOverall:50,cost:5e4,buildTime:30,required:2e3},{id:"acad_4",name:"Ontwikkelde Academie",youthPerMonth:2,maxOverall:60,cost:15e4,buildTime:45,required:6e3},{id:"acad_5",name:"Pro Academie",youthPerMonth:3,maxOverall:70,cost:4e5,buildTime:60,required:15e3},{id:"acad_6",name:"Elite Academie",youthPerMonth:4,maxOverall:80,cost:1e6,buildTime:90,required:3e4},{id:"acad_7",name:"Wereldklasse Academie",youthPerMonth:5,maxOverall:90,cost:25e5,buildTime:120,required:5e4}],scouting:[{id:"scout_1",name:"Geen",range:"lokaal",info:"overall",cost:0,buildTime:0,required:0},{id:"scout_2",name:"Lokale Scout",range:"regio",info:"3 attributen",cost:15e3,buildTime:5,required:0},{id:"scout_3",name:"Regionale Scouts",range:"Nederland",info:"alle attributen",cost:5e4,buildTime:10,required:1e3},{id:"scout_4",name:"Nationale Scouts",range:"Benelux",info:"+ persoonlijkheid",cost:15e4,buildTime:20,required:4e3},{id:"scout_5",name:"Europese Scouts",range:"Europa",info:"+ potentieel",cost:4e5,buildTime:30,required:15e3},{id:"scout_6",name:"Wereldwijde Scouts",range:"Wereld",info:"alles",cost:1e6,buildTime:45,required:35e3}],sponsoring:[{id:"sponsor_1",name:"Geen",dailyIncome:0,cost:0,buildTime:0,required:0},{id:"sponsor_2",name:"Reclamebord Langs Veld",dailyIncome:50,cost:5e3,buildTime:3,required:0},{id:"sponsor_3",name:"Meerdere Reclameborden",dailyIncome:150,cost:2e4,buildTime:7,required:500},{id:"sponsor_4",name:"LED Borden",dailyIncome:400,cost:75e3,buildTime:14,required:2e3},{id:"sponsor_5",name:"Shirtsponsor",dailyIncome:1e3,cost:2e5,buildTime:21,required:6e3},{id:"sponsor_6",name:"Hoofdsponsor Pakket",dailyIncome:2500,cost:5e5,buildTime:30,required:15e3},{id:"sponsor_7",name:"Naamrechten Stadion",dailyIncome:8e3,cost:2e6,buildTime:60,required:35e3}],kantine:[{id:"kantine_1",name:"Geen",effect:"geen bonus",cost:0,buildTime:0,required:0},{id:"kantine_2",name:"Picknicktafel",effect:"+2% morale",cost:3e3,buildTime:2,required:0},{id:"kantine_3",name:"Basis Kantine",effect:"+5% morale",cost:15e3,buildTime:7,required:500},{id:"kantine_4",name:"Moderne Kantine",effect:"+8% morale",cost:5e4,buildTime:14,required:2e3},{id:"kantine_5",name:"Luxe Kantine",effect:"+12% morale",cost:15e4,buildTime:21,required:6e3},{id:"kantine_6",name:"Restaurant Kwaliteit",effect:"+15% morale, +5% fitness",cost:4e5,buildTime:30,required:15e3}],perszaal:[{id:"pers_1",name:"Geen",effect:"geen bonus",cost:0,buildTime:0,required:0},{id:"pers_2",name:"Interview Hoek",effect:"+1 reputatie/week",cost:1e4,buildTime:5,required:500},{id:"pers_3",name:"Kleine Perszaal",effect:"+2 reputatie/week",cost:4e4,buildTime:10,required:2e3},{id:"pers_4",name:"Media Kamer",effect:"+4 reputatie/week",cost:12e4,buildTime:21,required:6e3},{id:"pers_5",name:"Professionele Perszaal",effect:"+6 reputatie/week",cost:3e5,buildTime:30,required:15e3},{id:"pers_6",name:"Broadcast Studio",effect:"+10 reputatie/week, TV bonus",cost:75e4,buildTime:45,required:3e4}],hotel:[{id:"hotel_1",name:"Geen",effect:"geen bonus",cost:0,buildTime:0,required:0},{id:"hotel_2",name:"Slaapzaal",effect:"+3% fitness recovery",cost:25e3,buildTime:14,required:2e3},{id:"hotel_3",name:"Basis Kamers",effect:"+5% fitness recovery",cost:8e4,buildTime:21,required:6e3},{id:"hotel_4",name:"Comfort Suites",effect:"+8% fitness recovery",cost:2e5,buildTime:30,required:15e3},{id:"hotel_5",name:"Luxe Appartementen",effect:"+12% fitness recovery",cost:5e5,buildTime:45,required:25e3},{id:"hotel_6",name:"Vijfsterren Resort",effect:"+15% fitness, +5% morale",cost:15e5,buildTime:60,required:4e4}]};function H(e){return S[e]?.group||"midfielder"}function y(e,t){return Math.floor(Math.random()*(t-e+1))+e}function C(e){return e[Math.floor(Math.random()*e.length)]}function b(e){return"€"+e.toLocaleString("nl-NL")}function Gt(e){return e.split(" ").map(t=>t[0]).join("").substring(0,2).toUpperCase()}function ne(e){return Ft.find(t=>t.id===e)}function Kt(e,t){return t<=19?Math.min(99,e+y(15,35)):t<=23?Math.min(99,e+y(10,25)):t<=27?Math.min(99,e+y(5,15)):t<=30?Math.min(99,e+y(2,8)):Math.min(99,e+y(0,3))}function Ze(){const e=new Date,t=new Date(e);return t.setHours(24,0,0,0),t.getTime()}function _e(e){if(e<=0)return"Nu!";const t=Math.floor(e/(1e3*60*60)),n=Math.floor(e%(1e3*60*60)/(1e3*60)),i=Math.floor(e%(1e3*60)/1e3);return`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}:${String(i).padStart(2,"0")}`}let o={club:{name:"FC Goals Maken",division:8,budget:5e3,reputation:10,position:3,colors:{primary:"#1b5e20",secondary:"#f5f0e1",accent:"#ff9800"},settingsChangedThisSeason:!1,stats:{founded:1,titles:0,highestDivision:8,totalGoals:0,totalMatches:0}},manager:{xp:0,level:1},dailyRewards:{lastLogin:null,lastClaimDate:null,streak:0},achievements:{},eventHistory:{events:[],lastEventTime:null},stats:{wins:0,draws:0,losses:0,cleanSheets:0,comebacks:0,hatTricks:0,highestScoreMatch:0,currentUnbeaten:0,currentWinStreak:0,promotions:0,relegationEscapes:0,youthGraduates:0,highestSale:0,sellouts:0,homeWins:0,saturdayMatches:0},activeEvent:null,lastMatch:null,stadium:{tribune:"tribune_1",capacity:200,grass:"grass_0",horeca:[],fanshop:[],vip:[],parking:[],lighting:null,training:"train_1",medical:"med_1",academy:"acad_1",scouting:"scout_1",sponsoring:"sponsor_1",kantine:"kantine_1",perszaal:"pers_1",hotel:"hotel_1"},players:[],youthPlayers:[],lineup:new Array(11).fill(null),formation:"4-4-2",tactics:{mentality:"balanced",pressing:"medium",passingStyle:"mixed",tempo:"normal",width:"normal"},advancedTactics:{keeperPressure:!1,forceSetPieces:!1,fullbackRuns:"outside",marking:"zone",attackDefense:50,duelIntensity:50},specialists:{cornerTaker:null,penaltyTaker:null,freekickTaker:null,captain:null},transferMarket:{players:[],lastRefresh:null},trainers:{attack:1,midfield:1,defense:1,goalkeeper:1,fitness:1},training:{slots:{goalkeeper:{playerId:null,startTime:null,trainerId:null},defender:{playerId:null,startTime:null,trainerId:null},midfielder:{playerId:null,startTime:null,trainerId:null},attacker:{playerId:null,startTime:null,trainerId:null}},trainerStatus:{aan:{busy:!1,assignedSlot:null},ver:{busy:!1,assignedSlot:null},tec:{busy:!1,assignedSlot:null},sne:{busy:!1,assignedSlot:null},fys:{busy:!1,assignedSlot:null}},sessionDuration:360*60*1e3,teamTraining:{selected:null,bonus:null}},season:1,week:1,nextMatch:{opponent:"FC Rivaal",time:Date.now()-1e3},standings:[],scoutSearch:{minAge:16,maxAge:35,position:"all",results:[]},scoutMission:{active:!1,startTime:null,duration:60*1e3,pendingPlayer:null},finances:{history:[4500,4600,4800,4700,4900,5100,5e3]},staff:{fysio:null,scout:null,dokter:null},assistantTrainers:{attacking:null,defensive:null,technical:null,physical:null},sponsor:null,stadiumSponsor:null,scoutingNetwork:"none"},D={player:null,sourceIndex:null,isFromBench:!1};function Yt(){D.player=null,D.sourceIndex=null,D.isFromBench=!1}function lt(e){Object.keys(e).forEach(t=>{typeof e[t]=="object"&&e[t]!==null&&!Array.isArray(e[t])?o[t]={...o[t],...e[t]}:o[t]=e[t]})}const ye="zaterdagvoetbal_save",Wt=3e4;let Ee=null;function F(e){try{const t={version:"2.0",timestamp:Date.now(),state:e};return localStorage.setItem(ye,JSON.stringify(t)),console.log("💾 Game saved!"),!0}catch(t){return console.error("Failed to save game:",t),!1}}function Ut(){try{const e=localStorage.getItem(ye);if(!e)return console.log("📂 No save file found"),null;const t=JSON.parse(e);return console.log("📂 Game loaded from",new Date(t.timestamp).toLocaleString("nl-NL")),t.state}catch(e){return console.error("Failed to load game:",e),null}}function Jt(){try{const e=localStorage.getItem(ye);if(!e)return null;const t=JSON.parse(e);return{version:t.version,timestamp:t.timestamp,clubName:t.state?.club?.name||"Onbekend",division:t.state?.club?.division||8,season:t.state?.season||1,week:t.state?.week||1}}catch{return null}}function Zt(e){Ee&&clearInterval(Ee),Ee=setInterval(()=>{F(e)},Wt),window.addEventListener("beforeunload",()=>{F(e)}),console.log("🔄 Auto-save enabled (every 30 seconds)")}function Qt(e){const t=Jt();if(!t)return null;const n=Date.now(),i=n-t.timestamp,a=Math.floor(i/(1e3*60*60));if(a<1)return null;const s={hoursAway:a,trainingSessions:0,scoutMissionsCompleted:0,injuriesHealed:[],energyRecovered:0,matchesReady:!1};if(e.training.slots){const r=e.training.sessionDuration||216e5;for(const[l,c]of Object.entries(e.training.slots))c.playerId&&c.startTime&&n-c.startTime>=r&&s.trainingSessions++}return e.scoutMission?.active&&e.scoutMission?.startTime&&n-e.scoutMission.startTime>=e.scoutMission.duration&&(s.scoutMissionsCompleted=1),s.energyRecovered=Math.min(a*5,30),e.nextMatch?.time&&n>=e.nextMatch.time&&(s.matchesReady=!0),s}function Xt(e,t){t&&(t.energyRecovered>0&&e.players.forEach(n=>{n.energy=Math.min(100,(n.energy||70)+t.energyRecovered),n.fitness=Math.min(100,(n.fitness||80)+Math.floor(t.energyRecovered/2))}),console.log("⏰ Offline progress applied:",t))}function en(e){const t={version:"2.0",timestamp:Date.now(),state:e},n=new Blob([JSON.stringify(t,null,2)],{type:"application/json"}),i=URL.createObjectURL(n),a=document.createElement("a");a.href=i,a.download=`zaterdagvoetbal_${e.club.name.replace(/\s+/g,"_")}_${new Date().toISOString().split("T")[0]}.json`,a.click(),URL.revokeObjectURL(i),console.log("📤 Save exported")}function tn(e){return new Promise((t,n)=>{const i=new FileReader;i.onload=a=>{try{const s=JSON.parse(a.target.result);s.state&&s.version?(localStorage.setItem(ye,JSON.stringify(s)),t(s.state)):n(new Error("Invalid save file format"))}catch(s){n(s)}},i.onerror=()=>n(new Error("Failed to read file")),i.readAsText(e)})}const V={GOAL:"goal",SHOT_SAVED:"shot_saved",SHOT_MISSED:"shot_missed",FOUL:"foul",YELLOW_CARD:"yellow_card",RED_CARD:"red_card",INJURY:"injury"},nn={goal:["{player} schiet binnen! GOAL!","Daar is de {minute}! {player} scoort!","{player} kopt raak! Prachtige goal!","En daar gaat de bal in het net! {player} maakt 'm!","{player} schuift de bal beheerst binnen!","Vanaf de rand van de zestien... {player} SCOORT!","{player} maakt er {score} van!"],shot_saved:["{player} schiet, maar de keeper pakt 'm!","Goeie redding van de keeper op het schot van {player}!","{player} probeert het, maar de doelman redt!","De keeper strekt zich uit en houdt het schot van {player} tegen!"],shot_missed:["{player} schiet naast!","Het schot van {player} gaat over!","{player} mist het doel volledig!","Die had er in gemoeten! {player} schiet wild over!"],foul:["Overtreding van {player}!","{player} gaat te ver door en krijgt een vrije trap tegen!","De scheidsrechter fluit voor een overtreding van {player}!"],yellow_card:["Gele kaart voor {player}!","{player} krijgt geel voor die actie!","De scheidsrechter pakt geel voor {player}!"],red_card:["ROOD! {player} moet eruit!","{player} krijgt de rode kaart! Dat is een domper!","Directe rode kaart voor {player}! Ongelooflijk!"],injury:["{player} blijft liggen! Dat ziet er niet goed uit...","De verzorgers komen het veld op voor {player}!","{player} grijpt naar zijn been. Blessure!"],substitution:["{player} wordt gewisseld voor {sub}.","Wissel: {player} eraf, {sub} erin.","De trainer brengt {sub} voor {player}."],chance:["{player} krijgt een grote kans!","Daar is de kans voor {player}!","{player} komt oog in oog met de keeper!"],corner:["Corner voor {team}!","{player} trapt de corner!","Hoekschop, genomen door {player}!"],penalty:["PENALTY! De scheidsrechter wijst naar de stip!","{player} gaat achter de bal staan voor de penalty..."],save:["Geweldige redding van {player}!","{player} houdt zijn ploeg op de been met een knappe save!","De keeper {player} redt zijn team!"],half_time:["Rust! De stand is {homeScore}-{awayScore}.","Naar de kleedkamer met een {homeScore}-{awayScore} stand!"],full_time:["Het eindsignaal klinkt! {homeScore}-{awayScore}!","Einde wedstrijd: {homeScore}-{awayScore}!"]};function Le(e,t,n,i){if(!e||e.filter(g=>g!==null).length<11)return{attack:30,defense:30,midfield:30,overall:30};let a=0,s=0,r=0,l=0;const c=K[t];if(!c)return{attack:30,defense:30,midfield:30,overall:30};e.forEach((g,x)=>{if(!g)return;const k=c.positions[x];if(!k)return;const v=k.role,$=S[v]?.group||"midfielder";let M=1;g.position===v?M=1.1:S[g.position]?.group===$?M=.95:M=.75;const A=g.overall*M*(g.fitness/100);switch($){case"goalkeeper":l+=A;break;case"defender":s+=A;break;case"midfielder":r+=A;break;case"attacker":a+=A;break}});const d=Math.max(1,e.filter((g,x)=>g&&S[c.positions[x]?.role]?.group==="defender").length),u=Math.max(1,e.filter((g,x)=>g&&S[c.positions[x]?.role]?.group==="midfielder").length),f=Math.max(1,e.filter((g,x)=>g&&S[c.positions[x]?.role]?.group==="attacker").length);s=s/d,r=r/u,a=a/f;const m=Je.mentality.find(g=>g.id===n.mentality)?.effect||{},p=Je.pressing.find(g=>g.id===n.pressing)?.effect||{};a+=(m.attack||0)/2,s+=(m.defense||0)/2,r+=(p.pressing||0)/4,s=(s*3+l)/4;const h=(a+s+r)/3;return{attack:Math.round(Math.max(1,Math.min(99,a))),defense:Math.round(Math.max(1,Math.min(99,s))),midfield:Math.round(Math.max(1,Math.min(99,r))),goalkeeper:Math.round(Math.max(1,Math.min(99,l))),overall:Math.round(Math.max(1,Math.min(99,h)))}}function an(e,t=null){const n={8:["De Zondagsrust","Vv Zaterdagvoetbal","FC Derde Helft","SC Bierpomp","VV De Kansen","FC Buitenspel","SV De Keeper","VV Groen Wit"],7:["SC Sportief","VV Voorwaarts","FC Dynamisch","SV Actief","VV De Toekomst","FC Eendracht","SC Victoria","VV Sparta"],6:["FC Sterken","VV Progressief","SC Ambitie","SV Krachtig","VV Klimmen","FC Opwaarts","SC Stijgers","VV Winnaar"],5:["FC Elite","VV Toppers","SC Kampioen","SV Premier","VV De Beste","FC Gouden Bal","SC Trofee","VV Beker"],4:["FC Professioneel","VV Divisie","SC Competitie","SV Liga","VV Klasse","FC Niveau","SC Standaard","VV Kwaliteit"],3:["FC Sterren","VV Glorie","SC Majesteit","SV Koninglijk","VV Adellijk","FC Prestige","SC Ereklasse","VV Subliem"],2:["FC Ajax B","VV Oranje","SC Leeuwen","SV Nederland","VV Tulp","FC Windmolen","SC Kaas","VV Klompen"],1:["Jong Ajax","Jong PSV","Jong Feyenoord","Jong AZ","Jong Twente","Jong Utrecht","Jong Vitesse","Jong Heerenveen"],0:["Ajax","PSV","Feyenoord","AZ","FC Twente","FC Utrecht","Vitesse","SC Heerenveen"]},i=n[e]||n[8],a=C(i),s={8:{base:25,variance:10},7:{base:35,variance:10},6:{base:45,variance:10},5:{base:52,variance:10},4:{base:60,variance:10},3:{base:68,variance:10},2:{base:76,variance:8},1:{base:84,variance:6},0:{base:90,variance:5}},r=s[e]||s[8],l=r.base+y(-r.variance,r.variance);let c=0;return t!==null&&(t<=2?c=5:t<=4?c=2:t>=7&&(c=-3)),{name:a,strength:{attack:Math.min(99,l+y(-5,5)+c),defense:Math.min(99,l+y(-5,5)+c),midfield:Math.min(99,l+y(-5,5)+c),overall:Math.min(99,l+c)},position:t||y(1,8)}}function sn(e,t,n,i,a,s){const r=i?"home":"away",l=i?t:n,c=i?n:t,d=[],u=Math.random()*100,f=l.attack/(l.attack+c.defense)*100;if(u<f){const p=Math.random()*100,h=l.attack/2+y(-10,10);if(p<h*.3){const g=s?Me(s):null,x=s&&Math.random()>.4?on(s,g):null;d.push({minute:e,type:V.GOAL,team:r,player:g?.name||"Speler",playerId:g?.id,assist:x?.name,assistId:x?.id,commentary:U("goal",{player:g?.name||"Speler",minute:`${e}'`,score:`${a.home+(i?1:0)}-${a.away+(i?0:1)}`})})}else if(p<h*.6){const g=s?Me(s):null;d.push({minute:e,type:V.SHOT_SAVED,team:r,player:g?.name||"Speler",playerId:g?.id,commentary:U("shot_saved",{player:g?.name||"Speler"})})}else if(p<h){const g=s?Me(s):null;d.push({minute:e,type:V.SHOT_MISSED,team:r,player:g?.name||"Speler",playerId:g?.id,commentary:U("shot_missed",{player:g?.name||"Speler"})})}}if(Math.random()<.08){const p=s?C(s.filter(h=>h)):null;if(d.push({minute:e,type:V.FOUL,team:r,player:p?.name||"Speler",playerId:p?.id,commentary:U("foul",{player:p?.name||"Speler"})}),Math.random()<.25){const h=Math.random()<.05;d.push({minute:e,type:h?V.RED_CARD:V.YELLOW_CARD,team:r,player:p?.name||"Speler",playerId:p?.id,commentary:U(h?"red_card":"yellow_card",{player:p?.name||"Speler"})})}}if(Math.random()<.01){const p=s?C(s.filter(h=>h)):null;d.push({minute:e,type:V.INJURY,team:r,player:p?.name||"Speler",playerId:p?.id,commentary:U("injury",{player:p?.name||"Speler"})})}return d}function Me(e){const t=e.filter(s=>s!==null);if(t.length===0)return null;const n=t.map(s=>{let r=1;const l=S[s.position]?.group;return l==="attacker"?r+=4:l==="midfielder"&&(r+=2),r+=(s.attributes?.AAN||50)/25,r}),i=n.reduce((s,r)=>s+r,0);let a=Math.random()*i;for(let s=0;s<t.length;s++)if(a-=n[s],a<=0)return t[s];return t[0]}function on(e,t){const n=e.filter(r=>r!==null&&r.id!==t?.id);if(n.length===0)return null;const i=n.map(r=>{let l=1;const c=S[r.position]?.group;return c==="midfielder"?l+=3:c==="attacker"&&(l+=2),l+=(r.attributes?.SNE||50)/30,l}),a=i.reduce((r,l)=>r+l,0);let s=Math.random()*a;for(let r=0;r<n.length;r++)if(s-=i[r],s<=0)return n[r];return n[0]}function U(e,t){const n=nn[e];if(!n||n.length===0)return"";let i=C(n);for(const[a,s]of Object.entries(t))i=i.replace(new RegExp(`\\{${a}\\}`,"g"),s);return i}function rn(e,t,n,i,a,s=!0){const r={homeTeam:s?e:t,awayTeam:s?t:e,homeScore:0,awayScore:0,events:[],playerRatings:{},manOfTheMatch:null,possession:{home:50,away:50},shots:{home:0,away:0},shotsOnTarget:{home:0,away:0},fouls:{home:0,away:0},cards:{home:{yellow:0,red:0},away:{yellow:0,red:0}}},l=s?Le(n,i,a):t.strength,c=s?t.strength:Le(n,i,a);l.attack+=3,l.defense+=3;const d=l.midfield+c.midfield;r.possession.home=Math.round(l.midfield/d*100),r.possession.away=100-r.possession.home,n&&n.filter(p=>p).forEach(p=>{r.playerRatings[p.id]={player:p,rating:6+(Math.random()-.5),goals:0,assists:0,yellowCards:0,redCards:0}});const u=ln();for(const p of u){const h={home:r.homeScore,away:r.awayScore},x=Math.random()*100<r.possession.home,k=sn(p,l,c,x,h,x&&s?n:null);for(const v of k){r.events.push(v);const $=v.team;v.type===V.GOAL?($==="home"?r.homeScore++:r.awayScore++,r.shots[$]++,r.shotsOnTarget[$]++,v.playerId&&r.playerRatings[v.playerId]&&(r.playerRatings[v.playerId].goals++,r.playerRatings[v.playerId].rating+=1),v.assistId&&r.playerRatings[v.assistId]&&(r.playerRatings[v.assistId].assists++,r.playerRatings[v.assistId].rating+=.5)):v.type===V.SHOT_SAVED?(r.shots[$]++,r.shotsOnTarget[$]++):v.type===V.SHOT_MISSED?r.shots[$]++:v.type===V.FOUL?r.fouls[$]++:v.type===V.YELLOW_CARD?(r.cards[$].yellow++,v.playerId&&r.playerRatings[v.playerId]&&(r.playerRatings[v.playerId].yellowCards++,r.playerRatings[v.playerId].rating-=.5)):v.type===V.RED_CARD&&(r.cards[$].red++,v.playerId&&r.playerRatings[v.playerId]&&(r.playerRatings[v.playerId].redCards++,r.playerRatings[v.playerId].rating-=2))}p===45&&r.events.push({minute:45,type:"half_time",commentary:U("half_time",{homeScore:r.homeScore,awayScore:r.awayScore})})}r.events.push({minute:90,type:"full_time",commentary:U("full_time",{homeScore:r.homeScore,awayScore:r.awayScore})});let f=0,m=null;for(const[p,h]of Object.entries(r.playerRatings))h.rating=Math.max(4,Math.min(10,h.rating)),h.rating>f&&(f=h.rating,m=h.player);return r.manOfTheMatch=m,r}function ln(){const e=[];for(let t=1;t<=45;t++)Math.random()<.35&&e.push(t);for(let t=46;t<=90;t++)Math.random()<.35&&e.push(t);for(;e.length<15;){const t=y(1,90);e.includes(t)||e.push(t)}return e.sort((t,n)=>t-n)}function ct(e,t,n){const i=n?e:t,a=n?t:e;return i>a?"win":i<a?"loss":"draw"}function cn(e,t,n){const i=n&&t.homeScore>t.awayScore||!n&&t.awayScore>t.homeScore,a=t.homeScore===t.awayScore;e.forEach(s=>{if(!s)return;const r=t.playerRatings[s.id];if(!r)return;s.goals=(s.goals||0)+r.goals,s.assists=(s.assists||0)+r.assists;let l=0;i?l+=5:a?l+=1:l-=3,r.rating>=8?l+=3:r.rating>=7?l+=1:r.rating<5.5&&(l-=2),s.morale=Math.max(20,Math.min(100,(s.morale||70)+l)),s.fitness=Math.max(50,(s.fitness||90)-y(5,15)),s.energy=Math.max(30,(s.energy||80)-y(10,25))})}const Z={matchesPerSeason:14,teamsPerDivision:8,promotionSpots:2,relegationSpots:2,playoffSpots:{from:3,to:6}},dn=[{day:1,type:"cash",amount:100,description:"Welkom terug!"},{day:2,type:"cash",amount:200,description:"Dag 2 bonus!"},{day:3,type:"cash",amount:300,description:"Halverwege de week!"},{day:4,type:"cash",amount:400,description:"Doorzetten!"},{day:5,type:"cash",amount:500,description:"Bijna weekend!"},{day:6,type:"cash",amount:600,description:"Nog één dag!"},{day:7,type:"special",amount:1e3,description:"Week voltooid! Bonus!"}],$e=[{level:1,xpRequired:0,title:"Beginnend Trainer"},{level:2,xpRequired:100,title:"Assistent Coach"},{level:3,xpRequired:300,title:"Jeugdtrainer"},{level:4,xpRequired:600,title:"Trainer B"},{level:5,xpRequired:1e3,title:"Trainer A"},{level:6,xpRequired:1500,title:"Hoofdcoach"},{level:7,xpRequired:2200,title:"Ervaren Coach"},{level:8,xpRequired:3e3,title:"Tacticus"},{level:9,xpRequired:4e3,title:"Meestertrainer"},{level:10,xpRequired:5500,title:"Strategisch Genie"},{level:15,xpRequired:1e4,title:"Legendarische Coach"},{level:20,xpRequired:2e4,title:"Voetbalicoon"},{level:25,xpRequired:35e3,title:"Hall of Famer"},{level:30,xpRequired:5e4,title:"De Beste Aller Tijden"}],un={matchWin:50,matchDraw:20,matchLoss:10,cleanSheet:25,goalScored:5,promotion:500,title:1e3,youthGraduate:75,playerSold:25,stadiumUpgrade:50,achievementUnlocked:100};function dt(e,t,n=null){ne(t);const i=[],a={amateur:["Vv De Meeuwen","SC Concordia","FC Voorwaarts","SV Oranje","VV Eendracht","SC Victoria","FC De Toekomst","SV Sparta","VV Olympia","SC Hercules","FC Amicitia","SV Fortuna","VV De Adelaars","SC Minerva","FC Ons Dorp","SV De Sterren"],semipro:["FC Groningen Amateurs","SC Twente","VV Eindhoven","FC Rotterdam Zuid","SV Amsterdam Noord","VV Den Haag","SC Utrecht City","FC Brabant","SV Gelderland","VV Limburg"],pro:["Jong FC Utrecht","SC Cambuur","FC Emmen","VVV Venlo","Roda JC","NAC Breda","FC Dordrecht","Almere City FC"]};let s;t>=5?s=a.amateur:t>=2?s=a.semipro:s=a.pro;const r=[...s].sort(()=>Math.random()-.5);for(let c=0;c<Z.teamsPerDivision-1;c++){const d=r[c]||`FC Team ${c+1}`,u=y(0,Z.matchesPerSeason),f=y(0,u),m=y(0,u-f),p=u-f-m,h=f*y(2,4)+m*y(0,2)+p*y(0,1),g=p*y(2,4)+m*y(0,2)+f*y(0,1);i.push({name:d,played:u,won:f,drawn:m,lost:p,goalsFor:h,goalsAgainst:g,goalDiff:h-g,points:f*3+m,isPlayer:!1})}const l={name:e,played:0,won:0,drawn:0,lost:0,goalsFor:0,goalsAgainst:0,goalDiff:0,points:0,isPlayer:!0};return i.push(l),i.sort((c,d)=>d.points!==c.points?d.points-c.points:d.goalDiff!==c.goalDiff?d.goalDiff-c.goalDiff:d.goalsFor-c.goalsFor),i.forEach((c,d)=>{c.position=d+1}),i}function me(e,t,n,i){const a=e.find(s=>s.name===t);return a&&(a.played++,a.goalsFor+=n,a.goalsAgainst+=i,a.goalDiff=a.goalsFor-a.goalsAgainst,n>i?(a.won++,a.points+=3):n===i?(a.drawn++,a.points+=1):a.lost++,e.sort((s,r)=>r.points!==s.points?r.points-s.points:r.goalDiff!==s.goalDiff?r.goalDiff-s.goalDiff:r.goalsFor-s.goalsFor),e.forEach((s,r)=>{s.position=r+1})),e}function fn(e){return e.find(n=>n.isPlayer)&&e.forEach(n=>{if(n.isPlayer||Math.random()>.7)return;const i=e.filter(u=>u.name!==n.name&&!u.isPlayer);if(i.length===0)return;const a=C(i);let r=.4+(a.position-n.position)*.05;r=Math.max(.2,Math.min(.7,r));const l=Math.random();let c,d;l<r?(c=y(1,4),d=y(0,c-1)):l<r+.25?(c=y(0,3),d=c):(d=y(1,4),c=y(0,d-1)),me(e,n.name,c,d),me(e,a.name,d,c)}),e}function mn(e){const t=e.find(n=>n.isPlayer);return t&&t.played>=Z.matchesPerSeason}function ut(e,t){const n=e.find(s=>s.isPlayer);if(!n)return null;const i=n.position,a={position:i,points:n.points,goalsFor:n.goalsFor,goalsAgainst:n.goalsAgainst,won:n.won,drawn:n.drawn,lost:n.lost,isChampion:i===1,promoted:!1,relegated:!1,playoffs:!1,newDivision:t};return i<=Z.promotionSpots&&t>0?(a.promoted=!0,a.newDivision=t-1):i>Z.teamsPerDivision-Z.relegationSpots&&t<8?(a.relegated=!0,a.newDivision=t+1):i>=Z.playoffSpots.from&&i<=Z.playoffSpots.to&&(a.playoffs=!0),a}function pn(e){const t=ut(e.standings,e.club.division);if(t&&(e.club.division=t.newDivision,t.isChampion&&(e.club.stats.titles=(e.club.stats.titles||0)+1),t.newDivision<e.club.stats.highestDivision&&(e.club.stats.highestDivision=t.newDivision)),e.season++,e.week=1,e.standings=dt(e.club.name,e.club.division),e.players.forEach(i=>{i.age++,i.goals=0,i.assists=0}),e.youthPlayers&&e.youthPlayers.forEach(i=>{i.age++}),ne(e.club.division)){const i=t?.promoted?1.5:t?.relegated?.8:1.1;e.club.budget=Math.round(e.club.budget*i)}return e.club.settingsChangedThisSeason=!1,t}function ft(e){const t=Date.now(),n=new Date(t).toDateString();e.dailyRewards||(e.dailyRewards={lastLogin:null,lastClaimDate:null,streak:0});const i=e.dailyRewards.lastClaimDate;if(i===n)return{alreadyClaimed:!0,streak:e.dailyRewards.streak};const a=new Date(t-1440*60*1e3).toDateString();i===a?e.dailyRewards.streak++:e.dailyRewards.streak=1;const s=(e.dailyRewards.streak-1)%7+1,r=dn[s-1];return(r.type==="cash"||r.type==="special")&&(e.club.budget+=r.amount),e.dailyRewards.lastClaimDate=n,e.dailyRewards.lastLogin=t,{claimed:!0,streak:e.dailyRewards.streak,streakDay:s,reward:r}}function De(e){let t=$e[0];for(const i of $e)if(e>=i.xpRequired)t=i;else break;const n=$e.find(i=>i.xpRequired>e);return{level:t.level,title:t.title,xp:e,xpToNext:n?n.xpRequired-e:0,nextLevel:n?.level||t.level,progress:n?(e-t.xpRequired)/(n.xpRequired-t.xpRequired):1}}function oe(e,t,n=null){e.manager||(e.manager={xp:0,level:1});const i=n||un[t]||0,a=De(e.manager.xp);e.manager.xp+=i;const s=De(e.manager.xp);return{xpGained:i,totalXP:e.manager.xp,leveledUp:s.level>a.level,oldLevel:a.level,newLevel:s.level,newTitle:s.title}}function hn(e,t){const n=e.map(r=>r.name);e.find(r=>r.isPlayer)?.name;const i=[],a=n.length,s=(a-1)*2;for(let r=0;r<s;r++){const l=[];for(let c=0;c<a/2;c++){const d=(r+c)%(a-1);let u=(a-1-c+r)%(a-1);c===0&&(u=a-1),r>=a-1?l.push({home:n[u],away:n[d]}):l.push({home:n[d],away:n[u]})}i.push(l)}return i}function gn(e,t){const n=hn(e),i=e.find(d=>d.isPlayer);if(!i||t>n.length)return null;const s=n[t-1].find(d=>d.home===i.name||d.away===i.name);if(!s)return null;const r=s.home===i.name,l=r?s.away:s.home,c=e.find(d=>d.name===l);return{name:l,position:c?.position||4,isHome:r}}const w={MATCHES:"matches",GOALS:"goals",SEASON:"season",CLUB:"club",PLAYERS:"players",STADIUM:"stadium",SPECIAL:"special"},Oe={firstWin:{id:"firstWin",name:"Eerste Overwinning",description:"Win je eerste wedstrijd",category:w.MATCHES,icon:"🏆",reward:{cash:500},check:e=>e.club.stats.totalMatches>0&&yn(e)},tenWins:{id:"tenWins",name:"Routinier",description:"Win 10 wedstrijden",category:w.MATCHES,icon:"🎖️",reward:{cash:2e3},check:e=>(e.stats?.wins||0)>=10},fiftyWins:{id:"fiftyWins",name:"Winnaar",description:"Win 50 wedstrijden",category:w.MATCHES,icon:"🏅",reward:{cash:1e4},check:e=>(e.stats?.wins||0)>=50},hundredWins:{id:"hundredWins",name:"Meester",description:"Win 100 wedstrijden",category:w.MATCHES,icon:"👑",reward:{cash:25e3},check:e=>(e.stats?.wins||0)>=100},threeWinsInRow:{id:"threeWinsInRow",name:"Op Dreef",description:"Win 3 wedstrijden op rij",category:w.MATCHES,icon:"🔥",reward:{cash:1500},check:e=>(e.stats?.currentWinStreak||0)>=3},fiveWinsInRow:{id:"fiveWinsInRow",name:"Onstuitbaar",description:"Win 5 wedstrijden op rij",category:w.MATCHES,icon:"💪",reward:{cash:4e3},check:e=>(e.stats?.currentWinStreak||0)>=5},unbeatenRun:{id:"unbeatenRun",name:"Ongeslagen",description:"Blijf 5 wedstrijden ongeslagen",category:w.MATCHES,icon:"🛡️",reward:{cash:3e3},check:e=>(e.stats?.currentUnbeaten||0)>=5},cleanSheet:{id:"cleanSheet",name:"De Nul",description:"Houd je doel schoon",category:w.MATCHES,icon:"🧤",reward:{cash:500},check:e=>(e.stats?.cleanSheets||0)>=1},tenCleanSheets:{id:"tenCleanSheets",name:"Verdedigingswall",description:"Houd 10 keer je doel schoon",category:w.MATCHES,icon:"🧱",reward:{cash:5e3},check:e=>(e.stats?.cleanSheets||0)>=10},comeback:{id:"comeback",name:"Comeback King",description:"Win een wedstrijd na achterstand",category:w.MATCHES,icon:"🔄",reward:{cash:2e3},check:e=>(e.stats?.comebacks||0)>=1},firstGoal:{id:"firstGoal",name:"Eerste Doelpunt",description:"Scoor je eerste doelpunt",category:w.GOALS,icon:"⚽",reward:{cash:250},check:e=>(e.club.stats?.totalGoals||0)>=1},fiftyGoals:{id:"fiftyGoals",name:"Doelpuntenfabriek",description:"Scoor 50 doelpunten",category:w.GOALS,icon:"🎯",reward:{cash:5e3},check:e=>(e.club.stats?.totalGoals||0)>=50},hundredGoals:{id:"hundredGoals",name:"Goaltjesdief",description:"Scoor 100 doelpunten",category:w.GOALS,icon:"💯",reward:{cash:15e3},check:e=>(e.club.stats?.totalGoals||0)>=100},fiveGoalsMatch:{id:"fiveGoalsMatch",name:"Kansenregen",description:"Scoor 5+ doelpunten in één wedstrijd",category:w.GOALS,icon:"🌧️",reward:{cash:3e3},check:e=>(e.stats?.highestScoreMatch||0)>=5},hatTrick:{id:"hatTrick",name:"Hattrick Held",description:"Een speler scoort een hattrick",category:w.GOALS,icon:"🎩",reward:{cash:2500},check:e=>(e.stats?.hatTricks||0)>=1},promotion:{id:"promotion",name:"Kampioen!",description:"Promoveer naar een hogere divisie",category:w.SEASON,icon:"⬆️",reward:{cash:1e4},check:e=>(e.stats?.promotions||0)>=1},threePromotions:{id:"threePromotions",name:"Stijgende Ster",description:"Promoveer 3 keer",category:w.SEASON,icon:"🌟",reward:{cash:5e4},check:e=>(e.stats?.promotions||0)>=3},title:{id:"title",name:"Landskampioen",description:"Word kampioen van je divisie",category:w.SEASON,icon:"🏆",reward:{cash:25e3},check:e=>(e.club.stats?.titles||0)>=1},threeTitles:{id:"threeTitles",name:"Dynastie",description:"Win 3 kampioenschappen",category:w.SEASON,icon:"👑",reward:{cash:1e5},check:e=>(e.club.stats?.titles||0)>=3},topFlight:{id:"topFlight",name:"De Top Bereikt",description:"Bereik de Eredivisie",category:w.SEASON,icon:"🏛️",reward:{cash:5e5},check:e=>e.club.division===0},surviveRelegation:{id:"surviveRelegation",name:"Op Het Nippertje",description:"Ontsnap aan degradatie (eindig 6e)",category:w.SEASON,icon:"😅",reward:{cash:1e3},check:e=>(e.stats?.relegationEscapes||0)>=1},millionaire:{id:"millionaire",name:"Miljonair",description:"Heb €1.000.000 op de bank",category:w.CLUB,icon:"💰",reward:{xp:500},check:e=>e.club.budget>=1e6},tenMillion:{id:"tenMillion",name:"Tycoon",description:"Heb €10.000.000 op de bank",category:w.CLUB,icon:"💎",reward:{xp:2e3},check:e=>e.club.budget>=1e7},highReputation:{id:"highReputation",name:"Bekende Club",description:"Bereik 50 reputatie",category:w.CLUB,icon:"⭐",reward:{cash:5e3},check:e=>e.club.reputation>=50},topReputation:{id:"topReputation",name:"Topclub",description:"Bereik 90 reputatie",category:w.CLUB,icon:"🌟",reward:{cash:25e3},check:e=>e.club.reputation>=90},youthGraduate:{id:"youthGraduate",name:"Kweekvijver",description:"Laat een jeugdspeler doorstromen",category:w.PLAYERS,icon:"🌱",reward:{cash:1e3},check:e=>(e.stats?.youthGraduates||0)>=1},tenYouthGraduates:{id:"tenYouthGraduates",name:"Jeugdopleiding",description:"Laat 10 jeugdspelers doorstromen",category:w.PLAYERS,icon:"🏫",reward:{cash:2e4},check:e=>(e.stats?.youthGraduates||0)>=10},topScorer:{id:"topScorer",name:"Topscorer",description:"Heb een speler met 20+ goals in een seizoen",category:w.PLAYERS,icon:"🥇",reward:{cash:5e3},check:e=>e.players.some(t=>(t.goals||0)>=20)},starPlayer:{id:"starPlayer",name:"Sterspeler",description:"Heb een speler met 80+ overall",category:w.PLAYERS,icon:"⭐",reward:{cash:1e4},check:e=>e.players.some(t=>t.overall>=80)},legendPlayer:{id:"legendPlayer",name:"Legende",description:"Heb een speler met 90+ overall",category:w.PLAYERS,icon:"👑",reward:{cash:5e4},check:e=>e.players.some(t=>t.overall>=90)},fullSquad:{id:"fullSquad",name:"Volledige Selectie",description:"Heb 22 spelers in je selectie",category:w.PLAYERS,icon:"👥",reward:{cash:2500},check:e=>e.players.length>=22},goodTransfer:{id:"goodTransfer",name:"Transferkoning",description:"Verkoop een speler voor €100.000+",category:w.PLAYERS,icon:"💸",reward:{cash:5e3},check:e=>(e.stats?.highestSale||0)>=1e5},stadiumFull:{id:"stadiumFull",name:"Uitverkocht",description:"Vul je stadion volledig",category:w.STADIUM,icon:"🏟️",reward:{cash:2e3},check:e=>(e.stats?.sellouts||0)>=1},bigStadium:{id:"bigStadium",name:"Grote Capaciteit",description:"Bereik 5.000 stadioncapaciteit",category:w.STADIUM,icon:"🏗️",reward:{cash:1e4},check:e=>e.stadium.capacity>=5e3},hugeStadium:{id:"hugeStadium",name:"Mega Stadion",description:"Bereik 20.000 stadioncapaciteit",category:w.STADIUM,icon:"🏛️",reward:{cash:5e4},check:e=>e.stadium.capacity>=2e4},fullFacilities:{id:"fullFacilities",name:"Compleet Complex",description:"Upgrade alle faciliteiten naar niveau 3",category:w.STADIUM,icon:"🏢",reward:{cash:25e3},check:e=>vn(e)},derdeHelft:{id:"derdeHelft",name:"Derde Helft",description:"Speel 50 wedstrijden (ervaar de echte clubcultuur)",category:w.SPECIAL,icon:"🍺",reward:{cash:5e3},check:e=>(e.club.stats?.totalMatches||0)>=50},kantinedienst:{id:"kantinedienst",name:"Kantinedienst",description:"Upgrade de kantine naar niveau 3",category:w.SPECIAL,icon:"🍟",reward:{cash:3e3},check:e=>e.stadium.kantine==="kantine_3"},trouweSupporter:{id:"trouweSupporter",name:"Trouwe Supporter",description:"Log 7 dagen achter elkaar in",category:w.SPECIAL,icon:"❤️",reward:{cash:7500},check:e=>(e.dailyRewards?.streak||0)>=7},weekendVoetballer:{id:"weekendVoetballer",name:"Weekendvoetballer",description:"Speel een wedstrijd op zaterdag",category:w.SPECIAL,icon:"📅",reward:{cash:500},check:e=>(e.stats?.saturdayMatches||0)>=1},lokaleHeld:{id:"lokaleHeld",name:"Lokale Held",description:"Win 10 thuiswedstrijden",category:w.SPECIAL,icon:"🏠",reward:{cash:4e3},check:e=>(e.stats?.homeWins||0)>=10},perfectSeason:{id:"perfectSeason",name:"Verborgen",description:"Win alle wedstrijden in een seizoen",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:1e5},check:e=>e.stats?.perfectSeason===!0},scoreTen:{id:"scoreTen",name:"Verborgen",description:"Scoor 10+ doelpunten in één wedstrijd",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:15e3},check:e=>(e.stats?.highestScoreMatch||0)>=10},midnight:{id:"midnight",name:"Verborgen",description:"Speel om middernacht",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:1e3},check:e=>e.stats?.playedAtMidnight===!0},almostRelegation:{id:"almostRelegation",name:"Verborgen",description:"Ontsnap 3x aan degradatie",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:1e4},check:e=>(e.stats?.relegationEscapes||0)>=3},youthStar:{id:"youthStar",name:"Verborgen",description:"Train een jeugdspeler naar 85+ overall",category:w.SPECIAL,icon:"❓",hidden:!0,reward:{cash:25e3},check:e=>e.players.some(t=>t.fromYouth&&t.overall>=85)}};function yn(e){return(e.stats?.wins||0)>=1}function vn(e){return["training","medical","academy","scouting"].every(n=>{const i=e.stadium[n];return i&&i.endsWith("_3")})}function mt(){const e={};for(const t of Object.keys(Oe))e[t]={unlocked:!1,unlockedAt:null};return e}function ze(e){e.achievements||(e.achievements=mt());const t=[];for(const[n,i]of Object.entries(Oe))if(!e.achievements[n]?.unlocked)try{i.check(e)&&(e.achievements[n]={unlocked:!0,unlockedAt:Date.now()},i.reward&&(i.reward.cash&&(e.club.budget+=i.reward.cash),i.reward.xp&&e.manager&&(e.manager.xp=(e.manager.xp||0)+i.reward.xp)),t.push({...i,id:n}))}catch(a){console.error(`Error checking achievement ${n}:`,a)}return t}function pt(e){const t=[];for(const[n,i]of Object.entries(Oe))t.push({...i,id:n,unlocked:e.achievements?.[n]?.unlocked||!1,unlockedAt:e.achievements?.[n]?.unlockedAt||null});return t}function Pe(e){const t=pt(e),n=t.filter(a=>a.unlocked),i={};for(const a of Object.values(w)){const s=t.filter(l=>l.category===a),r=s.filter(l=>l.unlocked);i[a]={total:s.length,unlocked:r.length,progress:s.length>0?Math.round(r.length/s.length*100):0}}return{total:t.length,unlocked:n.length,progress:Math.round(n.length/t.length*100),byCategory:i}}const I={PLAYER:"player",STADIUM:"stadium",FINANCIAL:"financial",YOUTH:"youth",DUTCH:"dutch"},B={MINOR:"minor",MODERATE:"moderate",MAJOR:"major"},bn={playerInjuryTraining:{id:"playerInjuryTraining",category:I.PLAYER,severity:B.MODERATE,title:"Blessure op Training",getMessage:e=>`${e.player.name} heeft zich geblesseerd tijdens de training! Hij is ${e.weeks} weken uit de roulatie.`,icon:"🏥",probability:.03,condition:e=>e.players.length>0,choices:[{text:"Laat hem rusten",effect:(e,t)=>{t.player.injured=!0,t.player.injuryWeeks=t.weeks,t.player.fitness=Math.max(30,t.player.fitness-20)}},{text:"Versneld hersteltraject (€500)",effect:(e,t)=>{e.club.budget>=500&&(e.club.budget-=500,t.player.injured=!0,t.player.injuryWeeks=Math.max(1,t.weeks-1))},condition:e=>e.club.budget>=500}],getData:e=>({player:C(e.players),weeks:y(1,4)})},playerFormDrop:{id:"playerFormDrop",category:I.PLAYER,severity:B.MINOR,title:"Vormcrisis",getMessage:e=>`${e.player.name} heeft een moeilijke periode. Zijn moraal is gedaald.`,icon:"📉",probability:.04,condition:e=>e.players.length>0,choices:[{text:"Geef hem een peptalk",effect:(e,t)=>{t.player.morale=Math.max(30,t.player.morale-10)}},{text:"Laat hem even op de bank",effect:(e,t)=>{t.player.morale=Math.max(40,t.player.morale-5)}}],getData:e=>({player:C(e.players.filter(t=>t.morale>50))})},playerDemandRaise:{id:"playerDemandRaise",category:I.PLAYER,severity:B.MODERATE,title:"Salarisverhoging Gevraagd",getMessage:e=>`${e.player.name} wil een salarisverhoging van ${e.raise}% (€${e.newSalary-e.player.salary}/week extra).`,icon:"💰",probability:.02,condition:e=>e.players.some(t=>t.overall>=50),choices:[{text:"Akkoord",effect:(e,t)=>{t.player.salary=t.newSalary,t.player.morale=Math.min(100,t.player.morale+10)}},{text:"Weigeren",effect:(e,t)=>{t.player.morale=Math.max(20,t.player.morale-20)}},{text:"Onderhandelen (50% verhoging)",effect:(e,t)=>{t.player.salary=Math.round(t.player.salary*1.1),t.player.morale=Math.min(100,t.player.morale+3)}}],getData:e=>{const t=C(e.players.filter(i=>i.overall>=50)),n=y(10,30);return{player:t,raise:n,newSalary:Math.round(t.salary*(1+n/100))}}},playerBreakthrough:{id:"playerBreakthrough",category:I.PLAYER,severity:B.MAJOR,title:"Doorbraak!",getMessage:e=>`${e.player.name} heeft een geweldige week gehad! Zijn attributes zijn verbeterd.`,icon:"🌟",probability:.01,condition:e=>e.players.some(t=>t.age<=23&&t.overall<t.potential-5),choices:[{text:"Fantastisch!",effect:(e,t)=>{const n=Object.keys(t.player.attributes);for(let i=0;i<2;i++){const a=C(n);t.player.attributes[a]=Math.min(99,t.player.attributes[a]+y(2,4))}t.player.overall=Math.min(99,t.player.overall+y(1,3)),t.player.morale=Math.min(100,t.player.morale+15)}}],getData:e=>({player:C(e.players.filter(t=>t.age<=23&&t.overall<t.potential-5))})},stadiumVandalism:{id:"stadiumVandalism",category:I.STADIUM,severity:B.MODERATE,title:"Vandalisme",getMessage:e=>`Vandalen hebben schade aangericht aan je stadion. Reparatiekosten: €${e.cost}.`,icon:"🔨",probability:.015,condition:e=>e.stadium.capacity>500,choices:[{text:"Repareren",effect:(e,t)=>{e.club.budget-=t.cost}},{text:"Laten zitten (reputatie -5)",effect:(e,t)=>{e.club.reputation=Math.max(1,e.club.reputation-5)}}],getData:e=>({cost:y(200,1e3)})},stadiumWeatherDamage:{id:"stadiumWeatherDamage",category:I.STADIUM,severity:B.MINOR,title:"Stormschade",getMessage:e=>`Een storm heeft schade aangericht aan het dak van de tribune. Kosten: €${e.cost}.`,icon:"🌧️",probability:.02,condition:e=>!0,choices:[{text:"Direct repareren",effect:(e,t)=>{e.club.budget-=t.cost}}],getData:e=>({cost:y(100,500)})},sponsorOffer:{id:"sponsorOffer",category:I.FINANCIAL,severity:B.MAJOR,title:"Sponsoraanbod",getMessage:e=>`${e.sponsorName} wil je club sponsoren met €${e.amount} per week!`,icon:"🤝",probability:.01,condition:e=>e.club.reputation>=30,choices:[{text:"Accepteren",effect:(e,t)=>{e.club.budget+=t.amount*4,e.extraSponsors||(e.extraSponsors=[]),e.extraSponsors.push({name:t.sponsorName,weeklyIncome:t.amount})}},{text:"Afwijzen",effect:()=>{}}],getData:e=>({sponsorName:C(["Lokale Bakkerij","Autobedrijf Van Dijk","Café Het Dorstige Hert","Bouwbedrijf Constructie","Sportwinkel De Speelman","Kapsalon Knip & Go"]),amount:y(100,500)})},taxAudit:{id:"taxAudit",category:I.FINANCIAL,severity:B.MODERATE,title:"Belastingcontrole",getMessage:e=>`De Belastingdienst heeft een kleine fout gevonden. Je moet €${e.fine} betalen.`,icon:"📋",probability:.01,condition:e=>e.club.budget>1e3,choices:[{text:"Betalen",effect:(e,t)=>{e.club.budget-=t.fine}},{text:"In beroep gaan (50% kans)",effect:(e,t)=>{Math.random()>.5?e.club.budget-=Math.round(t.fine*.3):e.club.budget-=Math.round(t.fine*1.5)}}],getData:e=>({fine:Math.round(e.club.budget*.05)})},donation:{id:"donation",category:I.FINANCIAL,severity:B.MINOR,title:"Donatie",getMessage:e=>`Een anonieme weldoener heeft €${e.amount} gedoneerd aan de club!`,icon:"🎁",probability:.02,condition:e=>!0,choices:[{text:"Geweldig!",effect:(e,t)=>{e.club.budget+=t.amount}}],getData:e=>({amount:y(500,2e3)})},wonderkindSpotted:{id:"wonderkindSpotted",category:I.YOUTH,severity:B.MAJOR,title:"Wonderkind Gespot!",getMessage:e=>`Je scout heeft een bijzonder talent ontdekt: ${e.playerName}, ${e.age} jaar. Wil je hem naar de jeugd halen?`,icon:"🌟",probability:.008,condition:e=>e.scoutingNetwork!=="none",choices:[{text:"Aannemen",effect:(e,t)=>{e.youthPlayers||(e.youthPlayers=[]),e.youthPlayers.push(t.player)}},{text:"Niet interessant",effect:()=>{}}],getData:e=>{const t=y(14,17),n=y(60,85);return{playerName:`${C(["Jayden","Dani","Nouri","Mo","Justin"])} ${C(["de Jong","Bakker","El Ghazi"])}`,age:t,player:{id:Date.now()+Math.random(),name:"Jayden de Jong",age:t,position:C(["centraleMid","spits","linksbuiten"]),overall:y(25,40),potential:n,attributes:{AAN:y(20,40),VER:y(20,40),SNE:y(20,40),FYS:y(20,40)}}}}},youthBreakthrough:{id:"youthBreakthrough",category:I.YOUTH,severity:B.MODERATE,title:"Jeugdspeler Klopt Aan",getMessage:e=>`Jeugdspeler ${e.player.name} wil graag doorstromen naar het eerste elftal!`,icon:"🎓",probability:.03,condition:e=>e.youthPlayers&&e.youthPlayers.length>0,choices:[{text:"Laat hem doorstromen",effect:(e,t)=>{e.players.push(t.player),e.youthPlayers=e.youthPlayers.filter(n=>n.id!==t.player.id),e.stats||(e.stats={}),e.stats.youthGraduates=(e.stats.youthGraduates||0)+1}},{text:"Nog een seizoen wachten",effect:(e,t)=>{t.player.morale=Math.max(30,(t.player.morale||70)-15)}}],getData:e=>({player:C(e.youthPlayers.filter(t=>t.age>=17))})},kantinedienst:{id:"kantinedienst",category:I.DUTCH,severity:B.MINOR,title:"Kantinedienst",getMessage:e=>`Het is ${e.player.name} zijn beurt voor kantinedienst dit weekend. Frikandellen bakken!`,icon:"🍟",probability:.05,condition:e=>e.players.length>0,choices:[{text:"Prima, hoort erbij!",effect:(e,t)=>{t.player.morale=Math.min(100,t.player.morale+3),e.club.budget+=50}},{text:"Laat iemand anders het doen (€50)",effect:(e,t)=>{e.club.budget-=50}}],getData:e=>({player:C(e.players)})},scheidsrechterControverse:{id:"scheidsrechterControverse",category:I.DUTCH,severity:B.MINOR,title:"Scheidsrechter Controversie",getMessage:e=>"De scheidsrechter van vorige week heeft een discutabele beslissing genomen. De spelers zijn ontevreden.",icon:"🟨",probability:.04,condition:e=>e.club.stats?.totalMatches>0,choices:[{text:"Klacht indienen",effect:(e,t)=>{Math.random()>.5?e.club.reputation=Math.min(100,e.club.reputation+2):e.club.reputation=Math.max(1,e.club.reputation-1)}},{text:"Laten rusten",effect:(e,t)=>{e.players.forEach(n=>{n.morale=Math.max(30,n.morale-2)})}}],getData:e=>({})},derdeHelftIncident:{id:"derdeHelftIncident",category:I.DUTCH,severity:B.MINOR,title:"Derde Helft Incident",getMessage:e=>`Tijdens de derde helft in de kantine ging het er gezellig aan toe. ${e.player.name} heeft iets te veel gedronken...`,icon:"🍺",probability:.03,condition:e=>e.players.length>0,choices:[{text:"Lachen, het hoort erbij",effect:(e,t)=>{t.player.fitness=Math.max(50,t.player.fitness-10),t.player.morale=Math.min(100,t.player.morale+5)}},{text:"Streng toespreken",effect:(e,t)=>{t.player.morale=Math.max(30,t.player.morale-5)}}],getData:e=>({player:C(e.players)})},kunstgrasDebat:{id:"kunstgrasDebat",category:I.DUTCH,severity:B.MINOR,title:"Kunstgras Debat",getMessage:e=>"De gemeente overweegt om kunstgras aan te leggen. De oudere spelers zijn tegen, de jongeren zijn voor.",icon:"🏟️",probability:.01,condition:e=>e.stadium.grass!=="grass_3",choices:[{text:"Steun kunstgras",effect:(e,t)=>{e.players.filter(n=>n.age<25).forEach(n=>{n.morale=Math.min(100,n.morale+3)}),e.players.filter(n=>n.age>=25).forEach(n=>{n.morale=Math.max(30,n.morale-2)})}},{text:"Blijf bij natuurgras",effect:(e,t)=>{e.players.filter(n=>n.age>=25).forEach(n=>{n.morale=Math.min(100,n.morale+2)})}}],getData:e=>({})},toernooiUitnodiging:{id:"toernooiUitnodiging",category:I.DUTCH,severity:B.MINOR,title:"Toernooi Uitnodiging",getMessage:e=>`Je bent uitgenodigd voor het ${e.tournamentName}! Deelname kost €${e.cost} maar kan €${e.prize} opleveren.`,icon:"🏆",probability:.02,condition:e=>!0,choices:[{text:"Deelnemen",effect:(e,t)=>{e.club.budget-=t.cost,Math.random()<.3?(e.club.budget+=t.prize,e.club.reputation=Math.min(100,e.club.reputation+3)):Math.random()<.5&&(e.club.budget+=Math.round(t.prize*.3)),e.players.forEach(n=>{n.morale=Math.min(100,n.morale+2)})}},{text:"Afzeggen",effect:()=>{}}],getData:e=>({tournamentName:C(["Dorpstoernooi","Paastoernooi","Zomertoernooi","Nieuwjaarstoernooi","Kroegentocht Cup","Lokale Derby Days"]),cost:y(100,300),prize:y(500,2e3)})},lokaleSlagerSponsor:{id:"lokaleSlagerSponsor",category:I.DUTCH,severity:B.MINOR,title:"Lokale Slager Sponsort",getMessage:e=>`Slagerij "${e.slagerName}" wil 100 frikandellen leveren voor de kantine en vraagt reclamebord-ruimte.`,icon:"🥩",probability:.02,condition:e=>!0,choices:[{text:"Deal! Frikandellen zijn altijd welkom",effect:(e,t)=>{e.club.budget+=75,e.club.reputation=Math.min(100,e.club.reputation+1)}},{text:"We willen geen reclame",effect:()=>{}}],getData:e=>({slagerName:C(["De Vette Knol","Het Gouden Varken","Slagerij Van Dam","De Lokale Slager"])})},veldbezettingConflict:{id:"veldbezettingConflict",category:I.DUTCH,severity:B.MINOR,title:"Veldbezetting Conflict",getMessage:e=>"De jeugd van een andere club claimt dat zij het veld gereserveerd hadden voor training.",icon:"⚽",probability:.03,condition:e=>!0,choices:[{text:"Veld delen",effect:(e,t)=>{e.club.reputation=Math.min(100,e.club.reputation+2)}},{text:"Wij hebben voorrang",effect:(e,t)=>{e.club.reputation=Math.max(1,e.club.reputation-1)}}],getData:e=>({})},rijdendeTapWagen:{id:"rijdendeTapWagen",category:I.DUTCH,severity:B.MINOR,title:"Rijdende Tap Kapot",getMessage:e=>`De rijdende tap is kapot gegaan! Reparatie kost €${e.cost}. Zonder tap geen bier bij uitwedstrijden...`,icon:"🚐",probability:.02,condition:e=>e.club.budget>200,choices:[{text:"Direct repareren",effect:(e,t)=>{e.club.budget-=t.cost,e.players.forEach(n=>{n.morale=Math.min(100,n.morale+2)})}},{text:"Even wachten",effect:(e,t)=>{e.players.forEach(n=>{n.morale=Math.max(30,n.morale-3)})}}],getData:e=>({cost:y(150,400)})}};function xn(e){const t=Object.values(bn).filter(a=>a.condition(e)?Math.random()<a.probability:!1);if(t.length===0)return null;const n=C(t),i=n.getData(e);return!i||i.player===void 0&&n.getData.toString().includes("player")?null:{...n,data:i,message:n.getMessage(i)}}function wn(e,t,n){const i=t.choices[n];if(i)return i.condition&&!i.condition(e)?{success:!1,reason:"Voorwaarden niet voldaan"}:(i.effect(e,t.data),{success:!0})}function kn(e,t=1){const n=[];for(let i=0;i<t*3&&!(n.length>=t);i++){const a=xn(e);a&&!n.find(s=>s.id===a.id)&&n.push(a)}return n}function Sn(){return{events:[],lastEventTime:null}}function En(e,t,n){e.eventHistory||(e.eventHistory=Sn()),e.eventHistory.events.push({id:t.id,title:t.title,message:t.message,choiceIndex:n,timestamp:Date.now(),season:e.season,week:e.week}),e.eventHistory.lastEventTime=Date.now(),e.eventHistory.events.length>50&&(e.eventHistory.events=e.eventHistory.events.slice(-50))}function ht(e){if(!e.eventHistory?.lastEventTime)return!0;const t=3600*1e3;return Date.now()-e.eventHistory.lastEventTime>=t}function E(e,t="info"){const n=document.querySelector(".game-notification");n&&n.remove();const i=document.createElement("div");i.className=`game-notification notification-${t}`,i.innerHTML=`
        <span class="notification-icon">${Mn(t)}</span>
        <span class="notification-message">${e}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `,document.body.appendChild(i),setTimeout(()=>{i.parentElement&&(i.classList.add("notification-fade-out"),setTimeout(()=>i.remove(),300))},4e3)}function Mn(e){switch(e){case"success":return"✓";case"error":return"✕";case"warning":return"⚠";case"achievement":return"🏆";default:return"ℹ"}}window.showNotification=E;function $n(){return`${C(Ae)} ${C(Ie)}`}function Tn(){const e=[40,8,8,5,5,5,4,4,3,3,3,2,2,2,2,2,2,2,1,3,3,1,1,2],t=e.reduce((i,a)=>i+a,0);let n=Math.random()*t;for(let i=0;i<te.length;i++)if(n-=e[i],n<=0)return te[i];return te[0]}function Cn(e,t){const n=ne(e),i={};(t==="keeper"?["REF","BAL","SNE","FYS"]:["AAN","VER","SNE","FYS"]).forEach(c=>{i[c]=y(n.minAttr,n.maxAttr)});const r=S[t],l=Object.entries(r.weights).sort((c,d)=>d[1]-c[1])[0][0];return i[l]=Math.min(99,i[l]+y(5,15)),i}function gt(e,t){const n=S[t].weights;let i=0;for(const[a,s]of Object.entries(n))i+=e[a]*s;return Math.round(i)}function An(e,t){const n=ot[t];if(!n)return{name:"Speler",bonus:{}};let i="AAN",a=0;for(const[s,r]of Object.entries(e))r>a&&(a=r,i=s);return n[i]||{name:"Speler",bonus:{}}}function In(e,t){const n=8-e,i=t>.8?"top":t>.2?"middle":"bottom";let a,s;n<=2?i==="top"?(a=.2,s=.6):i==="middle"?(a=.5,s=.3):(a=.7,s=.1):(a=.5,s=.3);const r=Math.random();return r<a?C(Q.good):r<a+s?C(Q.bad):C(Q.neutral)}function L(e,t=null,n=17,i=35){if(!t){const m=["keeper","linksback","centraleVerdediger","rechtsback","centraleMid","linksbuiten","rechtsbuiten","spits"],p=[.08,.1,.16,.1,.22,.1,.1,.14],h=Math.random();let g=0;for(let x=0;x<m.length;x++)if(g+=p[x],h<g){t=m[x];break}}const a=Cn(e,t),s=gt(a,t),r=ne(e),l=(s-r.minAttr)/(r.maxAttr-r.minAttr),c=Tn(),d=An(a,t),u=$n(),f=y(n,i);return{id:Date.now()+Math.random(),name:u,age:f,position:t,nationality:c,attributes:a,overall:s,tag:d.name,tagBonus:d.bonus,personality:In(e,l),salary:Math.round(r.salary.min+(r.salary.max-r.salary.min)*(s/100)),goals:y(0,5),assists:y(0,3),morale:y(60,90),fitness:y(80,100),condition:y(70,100),energy:y(60,100),potential:Kt(s,f),photo:ve()}}function ve(e,t){const n=["#f5d0c5","#e8beac","#d4a574","#c68642","#8d5524","#6b4423"],i=["#1a1a1a","#3d2314","#6b4423","#8b7355","#d4a76a","#c4c4c4"],a=["short","medium","bald","curly","long"];return{skinTone:C(n),hairColor:C(i),hairStyle:C(a),seed:Math.floor(Math.random()*1e3)}}function Bn(e){const t=[];for(let n=0;n<2;n++)t.push(L(e,"keeper"));t.push(L(e,"linksback")),t.push(L(e,"centraleVerdediger")),t.push(L(e,"centraleVerdediger")),t.push(L(e,"rechtsback")),t.push(L(e,"centraleVerdediger"));for(let n=0;n<5;n++)t.push(L(e,"centraleMid"));return t.push(L(e,"linksbuiten")),t.push(L(e,"linksbuiten")),t.push(L(e,"rechtsbuiten")),t.push(L(e,"rechtsbuiten")),t.push(L(e,"spits")),t.push(L(e,"spits")),t}function Ln(e,t){if(!e)return 0;let n=0;if(e.position===t)n+=100;else{const i=H(e.position),a=H(t);i===a?n+=75:{linksback:["linksbuiten","centraleMid"],rechtsback:["rechtsbuiten","centraleMid"],centraleVerdediger:["centraleMid"],centraleMid:["linksbuiten","rechtsbuiten","centraleVerdediger","linksback","rechtsback"],linksbuiten:["linksback","centraleMid","spits"],rechtsbuiten:["rechtsback","centraleMid","spits"],spits:["linksbuiten","rechtsbuiten","centraleMid"]}[t]?.includes(e.position)?n+=50:t!=="keeper"&&e.position!=="keeper"&&(n+=25)}return n}function yt(e,t){const n=[],i=K[t].positions;for(let a=0;a<11;a++){const s=e[a];if(!s)continue;const r=i[a];let l=0;for(let c=0;c<11;c++){if(a===c||!e[c])continue;const d=i[c];Math.sqrt(Math.pow(r.x-d.x,2)+Math.pow(r.y-d.y,2))<30&&e[c].nationality.code===s.nationality.code&&(l+=1)}n.push({playerId:s.id,nationalityBonus:l,positionFit:Ln(s,r.role)})}return n}function Dn(){const e=K[o.formation];let t=0,n=0;const i=yt(o.lineup,o.formation);for(let a=0;a<11;a++){const s=o.lineup[a];if(!s)continue;n++;const r=i.find(c=>c.playerId===s.id);let l=r?.positionFit||0;l+=(r?.nationalityBonus||0)*5,e.idealTags?.includes(s.tag)&&(l+=10),t+=l}return n>0?Math.round(t/n):0}function He(e){const t=[50,75,100,150,200,300];return t[Math.min(e,t.length-1)]}function O(e,t){const i=Math.pow(.65,t-1),a=Math.round(25*i),s=Math.floor((Math.random()-.5)*a*.3);return{min:Math.max(1,e-a+s),max:Math.min(99,e+a+s),range:a}}function Pn(e,t,n,i=8){const a=[],s=o.club.division,r=o.stadium.scouting;Y.scouting.find(d=>d.id===r);const c=Math.max(0,s+(r==="scout_5"||r==="scout_6"?-1:0));for(let d=0;d<i;d++){const f=L(c,e==="all"?null:e,t,n);f.price=be(f,c),f.scoutCount=1,f.totalScoutCost=He(0),f.scoutRanges={overall:O(f.overall,f.scoutCount),potential:O(f.potential,f.scoutCount),attack:O(f.attack,f.scoutCount),defense:O(f.defense,f.scoutCount),speed:O(f.speed,f.scoutCount),stamina:O(f.stamina,f.scoutCount)},f.scoutInfo={overall:!0,attributes:["scout_3","scout_4","scout_5","scout_6"].includes(r),personality:["scout_4","scout_5","scout_6"].includes(r),potential:["scout_5","scout_6"].includes(r)},a.push(f)}return a.sort((d,u)=>u.overall-d.overall)}function jn(e){const t=o.scoutSearch.results.find(i=>i.id===e);if(!t)return{success:!1,message:"Speler niet gevonden"};const n=He(t.scoutCount);return o.club.budget<n?{success:!1,message:`Niet genoeg budget! Je hebt ${b(n)} nodig.`}:(o.club.budget-=n,t.scoutCount++,t.totalScoutCost+=n,t.scoutRanges={overall:O(t.overall,t.scoutCount),potential:O(t.potential,t.scoutCount),attack:O(t.attack,t.scoutCount),defense:O(t.defense,t.scoutCount),speed:O(t.speed,t.scoutCount),stamina:O(t.stamina,t.scoutCount)},P(),ie(),{success:!0,message:`Scout rapport bijgewerkt! (${t.scoutCount}x gescout)`})}function Rn(e){o.scoutSearch.results.find(n=>n.id===e)&&(o.scoutSearch.dismissed||(o.scoutSearch.dismissed=[]),o.scoutSearch.dismissed.push(e),o.scoutSearch.results=o.scoutSearch.results.filter(n=>n.id!==e),ie())}function be(e,t,n=!0){const i=t||o.club?.division||6,a={8:.1,7:.2,6:.4,5:.8,4:1.5,3:3,2:8,1:25,0:75},s=e.overall||50,r=e.potential||s,l=e.age||25;let c=Math.pow(s,2)*(a[i]||.4)*100;const d=1+(r-s)/100;return c*=d,l<19?c*=1.8:l<22?c*=1.5:l<26?c*=1.2:l<29?c*=1:l<32?c*=.6:l<35?c*=.3:c*=.1,n&&Math.random()<.15?0:Math.round(c)}function Nn(e){return be(e,o.club?.division,!1)}function Fe(){const e=document.getElementById("standings-body");if(!e)return;const t=o.standings.length,n=2,i=t-2;let a="";o.standings.forEach((s,r)=>{const l=s.isPlayer,c=r+1;let d="";c<=n?d="promotion-zone":c>i&&(d="relegation-zone"),a+=`
            <tr class="${l?"is-player":""} ${d}">
                <td>${c}</td>
                <td>${s.name}</td>
                <td>${s.wins||0}</td>
                <td>${s.draws||0}</td>
                <td>${s.losses||0}</td>
                <td><strong>${s.points}</strong></td>
            </tr>
        `}),e.innerHTML=a}function Ge(){const e=document.getElementById("top-scorers");if(!e)return;const t=[...o.players].sort((i,a)=>a.goals-i.goals).slice(0,3);let n="";t.forEach((i,a)=>{n+=`
            <div class="performer-item">
                <span class="performer-rank ${a===0?"gold":a===1?"silver":"bronze"}">${a+1}</span>
                <div class="performer-info">
                    <span class="performer-name">${i.name}</span>
                    <span class="performer-position">${S[i.position].name}</span>
                </div>
                <span class="performer-goals">${i.goals}</span>
            </div>
        `}),e.innerHTML=n}function X(){const e=document.getElementById("player-cards");if(!e)return;const t={attacker:{name:"Aanvallers",icon:"⚽",players:[]},midfielder:{name:"Middenvelders",icon:"⚙️",players:[]},defender:{name:"Verdedigers",icon:"🛡️",players:[]},goalkeeper:{name:"Keepers",icon:"🧤",players:[]}};o.players.forEach(s=>{const r=H(s.position);t[r]&&t[r].players.push(s)}),Object.values(t).forEach(s=>{s.players.sort((r,l)=>l.overall-r.overall)});let n="";for(const[s,r]of Object.entries(t))r.players.length>0&&(n+=`<div class="squad-group">
                <div class="squad-group-header">
                    <span class="squad-group-icon">${r.icon}</span>
                    <span class="squad-group-name">${r.name}</span>
                    <span class="squad-group-count">${r.players.length}</span>
                </div>
                <div class="squad-group-players">
                    ${r.players.map(l=>Vn(l)).join("")}
                </div>
            </div>`);e.innerHTML=n;const i=document.getElementById("squad-count"),a=document.getElementById("squad-avg");if(i&&(i.textContent=o.players.length),a){const s=Math.round(o.players.reduce((r,l)=>r+l.overall,0)/o.players.length);a.textContent=s}document.querySelectorAll("#player-cards .player-card").forEach(s=>{s.addEventListener("click",()=>{const r=parseFloat(s.dataset.playerId);Ti(r)})})}function vt(e,t){if(t>=29)return e.toString();if(t>=26){const n=Math.max(e-2,e),i=Math.min(99,e+2);return`${n}-${i}`}else if(t>=23){const n=Math.max(e-4,e-2),i=Math.min(99,e+4);return`${n}-${i}`}else if(t>=20){const n=Math.max(1,e-6),i=Math.min(99,e+6);return`${n}-${i}`}else{const n=Math.max(1,e-10),i=Math.min(99,e+10);return`${n}-${i}`}}function pe(e){return e<=25?"#f44336":e<=50?"#ff9800":e<=75?"#4caf50":"#2e7d32"}function Vn(e,t=!1){const n=S[e.position]||{abbr:"??",color:"#666"};e.photo||ve(e.name,e.position);const i=e.position==="keeper";if(t)return`
            <div class="player-mini-card" data-player-id="${e.id}">
                <span class="mini-overall">${e.overall}</span>
                <span class="mini-flag">${e.nationality.flag}</span>
                <span class="mini-name">${e.name.split(" ")[0]}</span>
                <span class="mini-pos">${n.abbr}</span>
            </div>
        `;i?(e.attributes.REF||e.attributes.VER,e.attributes.BAL||e.attributes.AAN,e.attributes.SNE,e.attributes.FYS):(e.attributes.AAN,e.attributes.VER,e.attributes.SNE,e.attributes.FYS);const a=Nn(e),s=e.condition||85,r=e.energy||75,l=vt(e.potential,e.age);return`
        <div class="player-card" data-player-id="${e.id}">
            <div class="pc-left">
                <div class="pc-age-box">
                    <span class="pc-age-value">${e.age}</span>
                    <span class="pc-age-label">jr</span>
                </div>
                <span class="pc-flag-large">${e.nationality.flag}</span>
            </div>
            <div class="pc-info">
                <div class="pc-name-row">
                    <span class="pc-name">${e.name}</span>
                    <span class="pc-pos" style="background: ${n.color}">${n.abbr}</span>
                    <span class="pc-finance">
                        <span class="pc-salary">${b(e.salary||50)}/w</span>
                        <span class="pc-value">${b(a)}</span>
                    </span>
                </div>
            </div>
            <div class="pc-condition-bars">
                <div class="pc-bar-item">
                    <div class="pc-bar-track">
                        <div class="pc-bar-fill" style="width: ${s}%; background: ${pe(s)}"></div>
                    </div>
                    <span class="pc-bar-label">Conditie</span>
                </div>
                <div class="pc-bar-item">
                    <div class="pc-bar-track">
                        <div class="pc-bar-fill" style="width: ${r}%; background: ${pe(r)}"></div>
                    </div>
                    <span class="pc-bar-label">Energie</span>
                </div>
            </div>
            <div class="pc-ratings">
                <div class="pc-overall" style="background: ${n.color}">
                    <span class="pc-overall-value">${e.overall}</span>
                    <span class="pc-overall-label">ALG</span>
                </div>
                <div class="pc-potential" style="background: ${n.color}; opacity: 0.85;">
                    <span class="pc-potential-value">${l}</span>
                    <span class="pc-potential-label">POT</span>
                </div>
            </div>
        </div>
    `}function qn(){_n(),re(),le(),ce(),Yn(),ts()}function _n(){const e=document.getElementById("formation-select");if(!e)return;const t=Object.entries(K).sort((i,a)=>{const s=i[0].split("-").map(Number),r=a[0].split("-").map(Number);return r[0]!==s[0]?r[0]-s[0]:0});let n="";for(const[i,a]of t){const s=o.formation===i?"selected":"";n+=`<option value="${i}" ${s}>${i}</option>`}e.innerHTML=n,e.onchange=i=>{const a=o.formation,s=i.target.value,r=[...o.lineup],l=K[a]?.positions||[],c=K[s]?.positions||[],d=new Array(11).fill(null),u=new Set;c.forEach((f,m)=>{for(let p=0;p<11;p++){const h=r[p];if(!h||u.has(h.id))continue;if(l[p]?.role===f.role){d[m]=h,u.add(h.id);break}}}),c.forEach((f,m)=>{if(!d[m])for(let p=0;p<11;p++){const h=r[p];if(!h||u.has(h.id))continue;const g=On(h.position),x=zn(f.role);if(g===x){d[m]=h,u.add(h.id);break}}}),o.formation=s,o.lineup=d,re(),le(),ce()}}function On(e){return e==="keeper"?"keeper":["centraleVerdediger","linksback","rechtsback"].includes(e)?"defense":["centraleMid","aanvallendeMid","verdedigendeMid","linksbuiten","rechtsbuiten"].includes(e)?"midfield":["spits","schaduwspits"].includes(e)?"attack":"midfield"}function zn(e){return e==="keeper"?"keeper":["centraleVerdediger","linksback","rechtsback"].includes(e)?"defense":["centraleMid","aanvallendeMid","verdedigendeMid","linksbuiten","rechtsbuiten"].includes(e)?"midfield":["spits","schaduwspits"].includes(e)?"attack":"midfield"}function Hn(){const e=K[o.formation];if(!e)return{};const t={},n=30;return e.positions.forEach((i,a)=>{const s=o.lineup[a];if(!s)return;const r=[];e.positions.forEach((l,c)=>{if(a===c)return;const d=o.lineup[c];if(!d)return;const u=i.x-l.x,f=i.y-l.y;Math.sqrt(u*u+f*f)<=n&&r.push(d)}),r.length>0&&r.every(c=>c.nationality===s.nationality)&&(t[s.id]=1)}),t}function re(){const e=document.getElementById("lineup-pitch");if(!e)return;const t=K[o.formation];if(!t)return;const n=Hn();let i=`
        <div class="pitch-field">
            <div class="pitch-lines">
                <div class="center-circle"></div>
                <div class="center-line"></div>
                <div class="penalty-area-top"></div>
                <div class="penalty-area-bottom"></div>
            </div>
    `;t.positions.forEach((a,s)=>{const r=o.lineup[s],l=S[a.role],c=l?.color||"#666";let d="",u=0,f=!1;if(r){d=te.find(k=>k.code===r.nationality)?.flag||"🏳️",u=n[r.id]||0;const g=H(r.position),x=H(a.role);f=g!==x}const m=100-a.y,p=a.x;i+=`
            <div class="lineup-slot ${r?"filled":"empty"}"
                 style="left: ${m}%; top: ${p}%;"
                 data-slot-index="${s}"
                 data-role="${a.role}">
                ${r?`
                    <div class="lineup-player ${u>0?"has-chemistry":""} ${f?"wrong-position":""}"
                         draggable="true"
                         data-player-id="${r.id}"
                         style="background: ${c}">
                        <span class="lp-flag">${d}</span>
                        <span class="lp-overall">${r.overall+u}${u>0?'<span class="chemistry-boost">+'+u+"</span>":""}</span>
                        <span class="lp-name">${r.name.split(" ")[0]}</span>
                        <span class="lp-position">${S[r.position]?.abbr||r.position}</span>
                    </div>
                `:`
                    <div class="lineup-empty-slot" style="border-color: ${c}">
                        <span class="slot-pos">${l?.abbr||a.role}</span>
                    </div>
                `}
            </div>
        `}),i+="</div>",e.innerHTML=i,Fn()}function le(){const e=document.getElementById("lineup-available-players");if(!e)return;const t=o.lineup.filter(s=>s).map(s=>s.id),n=o.players.filter(s=>!t.includes(s.id)),i={attacker:{name:"Aanvallers",icon:"⚽",players:[]},midfielder:{name:"Middenvelders",icon:"⚙️",players:[]},defender:{name:"Verdedigers",icon:"🛡️",players:[]},goalkeeper:{name:"Keepers",icon:"🧤",players:[]}};n.forEach(s=>{const r=H(s.position);i[r]&&i[r].players.push(s)}),Object.values(i).forEach(s=>s.players.sort((r,l)=>l.overall-r.overall));let a="";for(const[s,r]of Object.entries(i))r.players.length!==0&&(a+=`
            <div class="player-group">
                <div class="player-group-header">${r.icon} ${r.name}</div>
                <div class="player-group-list">
        `,r.players.forEach(l=>{const c=S[l.position];a+=`
                <div class="available-player"
                     draggable="true"
                     data-player-id="${l.id}">
                    <span class="ap-overall" style="background: ${c?.color||"#666"}">${l.overall}</span>
                    <span class="ap-name">${l.name}</span>
                    <span class="ap-age">${l.age}j</span>
                    <span class="ap-pos">${c?.abbr||"??"}</span>
                </div>
            `}),a+="</div></div>");e.innerHTML=a,document.querySelectorAll(".available-player").forEach(s=>{s.addEventListener("dragstart",Gn),s.addEventListener("dragend",()=>{s.classList.remove("dragging")})})}function ce(){const e=document.getElementById("lineup-fit-fill"),t=document.getElementById("lineup-fit-score"),n=o.lineup.filter(a=>a).length,i=Math.round(n/11*100);e&&(e.style.width=`${i}%`),t&&(t.textContent=`${i}%`)}let q={player:null,fromSlot:null};function Fn(){document.querySelectorAll(".lineup-slot").forEach(t=>{t.addEventListener("dragover",n=>{n.preventDefault(),t.classList.add("drag-over")}),t.addEventListener("dragleave",()=>{t.classList.remove("drag-over")}),t.addEventListener("drop",n=>{n.preventDefault(),t.classList.remove("drag-over");const i=parseInt(t.dataset.slotIndex);Kn(i)})}),document.querySelectorAll(".lineup-player").forEach(t=>{t.addEventListener("dragstart",n=>{const i=parseFloat(t.dataset.playerId),a=parseInt(t.closest(".lineup-slot").dataset.slotIndex);q={player:o.players.find(s=>s.id===i),fromSlot:a},t.classList.add("dragging")}),t.addEventListener("dragend",()=>{t.classList.remove("dragging")})});const e=document.getElementById("lineup-available-players");e&&(e.addEventListener("dragover",t=>{t.preventDefault(),e.classList.add("drop-remove-zone")}),e.addEventListener("dragleave",t=>{e.contains(t.relatedTarget)||e.classList.remove("drop-remove-zone")}),e.addEventListener("drop",t=>{t.preventDefault(),e.classList.remove("drop-remove-zone"),q&&q.fromSlot!==void 0&&(o.lineup[q.fromSlot]=null,q=null,re(),le(),ce())}))}function Gn(e){const t=parseFloat(e.target.dataset.playerId);q={player:o.players.find(i=>i.id===t),fromSlot:null},e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",t.toString()),e.target.classList.add("dragging")}function Kn(e){if(!q.player)return;const t=o.lineup[e];o.lineup[e]=q.player,q.fromSlot!==null&&t?o.lineup[q.fromSlot]=t:q.fromSlot!==null&&(o.lineup[q.fromSlot]=null),q={player:null,fromSlot:null},re(),le(),ce()}function Yn(){document.querySelectorAll(".playstyle-btn").forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(".playstyle-btn").forEach(i=>i.classList.remove("active")),n.classList.add("active"),o.tactics.playstyle=n.dataset.style})}),document.querySelectorAll(".tactic-choice").forEach(n=>{n.addEventListener("click",()=>{n.parentElement.querySelectorAll(".tactic-choice").forEach(i=>i.classList.remove("active")),n.classList.add("active")})});const e=document.getElementById("tactic-width"),t=document.getElementById("width-info");e&&t&&e.addEventListener("input",()=>{const n=parseInt(e.value);n<30?t.textContent="Smal: Compacte verdediging, minder ruimte":n<70?t.textContent="Normaal: Standaard veldbreedte":t.textContent="Breed: Meer ruimte op vleugels, risicovol"})}function xe(){const e=document.getElementById("formation-positions");if(!e)return;const t=K[o.formation],n=yt(o.lineup,o.formation),i=[];for(let s=0;s<11;s++){const r=o.lineup[s];if(r)for(let l=s+1;l<11;l++){const c=o.lineup[l];if(c&&r.nationality.code===c.nationality.code){const d=t.positions[s],u=t.positions[l];Math.sqrt(Math.pow(d.x-u.x,2)+Math.pow(d.y-u.y,2))<30&&i.push({x1:d.x,y1:d.y,x2:u.x,y2:u.y,flag:r.nationality.flag})}}}let a=`
        <svg class="nationality-lines-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#4ade80;stop-opacity:1" />
                    <stop offset="50%" style="stop-color:#22c55e;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#4ade80;stop-opacity:1" />
                </linearGradient>
            </defs>
    `;i.forEach(s=>{a+=`
            <line class="nationality-line"
                  x1="${s.x1}" y1="${s.y1}"
                  x2="${s.x2}" y2="${s.y2}"
                  stroke="url(#lineGradient)"
                  stroke-width="0.8"
                  stroke-linecap="round"
                  stroke-dasharray="2,1" />
        `}),a+="</svg>",t.positions.forEach((s,r)=>{const l=o.lineup[r],c=l?n.find(p=>p.playerId===l.id):null;let d="",u="";if(l){const p=c?.positionFit||0,h=c?.nationalityBonus||0;p<50&&(d="penalty",u='<span class="position-penalty">-1</span>'),h>0&&(d+=" has-nationality-bonus",u+=`<span class="position-bonus">+${h}</span>`)}const f=l?"filled":"",m=S[s.role].color;a+=`
            <div class="position-slot ${f} ${d}"
                 style="left: ${s.x}%; top: ${s.y}%;"
                 data-index="${r}"
                 data-role="${s.role}"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event, ${r})">
                <div class="bonus-indicators">${u}</div>
                <div class="position-marker ${l?"has-player":""}"
                     style="background: ${l?m:"rgba(255,255,255,0.3)"}"
                     draggable="${l?"true":"false"}"
                     ondragstart="handleDragStart(event, ${r}, false)">
                    ${l?`
                        <span class="player-overall-badge">${l.overall}</span>
                        <span class="player-name-field">${l.name.split(" ")[0]}</span>
                    `:`
                        <span class="position-label">${s.name}</span>
                    `}
                </div>
            </div>
        `}),e.innerHTML=a}function Wn(){const e=document.getElementById("tactics-bench");if(!e)return;const t=o.lineup.filter(s=>s).map(s=>s.id),n=o.players.filter(s=>!t.includes(s.id)),i={attacker:{name:"Aanvallers",color:"#9c27b0",players:n.filter(s=>H(s.position)==="attacker")},midfielder:{name:"Middenvelders",color:"#4caf50",players:n.filter(s=>H(s.position)==="midfielder")},defender:{name:"Verdedigers",color:"#2196f3",players:n.filter(s=>H(s.position)==="defender")},goalkeeper:{name:"Keepers",color:"#f9a825",players:n.filter(s=>H(s.position)==="goalkeeper")}};let a="";for(const[s,r]of Object.entries(i))r.players.length!==0&&(a+=`
            <div class="bench-group">
                <h4 style="color: ${r.color}">${r.name}</h4>
                <div class="bench-players-row">
        `,r.players.forEach(l=>{const c=S[l.position];a+=`
                <div class="bench-player"
                     data-player-id="${l.id}"
                     draggable="true"
                     ondragstart="handleBenchDragStart(event, ${l.id})">
                    <span class="bench-overall" style="background: ${c.color}">${l.overall}</span>
                    <span class="bench-flag">${l.nationality.flag}</span>
                    <span class="bench-name">${l.name.split(" ")[0]}</span>
                    <span class="bench-pos">${c.abbr}</span>
                </div>
            `}),a+="</div></div>");e.innerHTML=a}function Un(){const e=Dn(),t=document.querySelector(".fit-fill"),n=document.querySelector(".fit-score"),i=document.querySelector(".fit-bonus");t&&(t.style.width=`${e}%`),n&&(n.textContent=`${e}%`),i&&(e>=90?(i.textContent="+15% Team Prestatie",i.className="fit-bonus excellent"):e>=80?(i.textContent="+10% Team Prestatie",i.className="fit-bonus good"):e>=70?(i.textContent="+5% Team Prestatie",i.className="fit-bonus ok"):e>=60?(i.textContent="Geen bonus",i.className="fit-bonus neutral"):(i.textContent=`${e>=50?"-5%":e>=40?"-10%":"-15%"} Team Prestatie`,i.className="fit-bonus bad"))}window.handleDragStart=function(e,t,n){D.sourceIndex=t,D.isFromBench=n,D.player=n?null:o.lineup[t],e.dataTransfer.effectAllowed="move"};window.handleBenchDragStart=function(e,t){const n=o.players.find(s=>s.id===t);D.player=n,D.isFromBench=!0,D.sourceIndex=null,e.dataTransfer.effectAllowed="move";let i=document.getElementById("drag-preview");i||(i=document.createElement("div"),i.id="drag-preview",i.className="drag-preview",document.body.appendChild(i));const a=S[n.position];i.innerHTML=`
        <div class="dp-overall" style="background: ${a?.color||"#666"}">${n.overall}</div>
        <div class="dp-name">${n.name.split(" ")[0]}</div>
    `,e.dataTransfer.setDragImage(i,30,30)};window.handleDragOver=function(e){e.preventDefault(),e.dataTransfer.dropEffect="move"};window.handleDrop=function(e,t){if(e.preventDefault(),D.isFromBench&&D.player)o.lineup[t],o.lineup[t]=D.player;else if(!D.isFromBench&&D.sourceIndex!==null){const n=o.lineup[t];o.lineup[t]=o.lineup[D.sourceIndex],o.lineup[D.sourceIndex]=n}Yt(),xe(),Wn(),Un()};function bt(){Vt(),Jn(),Zn(),wt(),ni(),rs()}function Jn(){const e=document.getElementById("tier-list-container");if(!e)return;const t=Y.tribunes.find(a=>a.id===o.stadium.tribune)?.capacity||200,n=[{name:"Kelderklasse",minCap:0,maxCap:500,color:"#8b6914",icon:"⚽",facilities:["Horeca","Parking","Training"]},{name:"Amateur",minCap:500,maxCap:2e3,color:"#4ade80",icon:"🥉",facilities:["Medical","Fanshop","Kantine"]},{name:"Semi-Pro",minCap:2e3,maxCap:1e4,color:"#60a5fa",icon:"🥈",facilities:["VIP","Verlichting","Jeugd","Perszaal"]},{name:"Professioneel",minCap:1e4,maxCap:35e3,color:"#a855f7",icon:"🥇",facilities:["Sponsoring","Hotel","Elite Training"]},{name:"Elite",minCap:35e3,maxCap:999999,color:"#f59e0b",icon:"🏆",facilities:["Wereldklasse Alles"]}];let i='<h3>🏆 Capaciteit Niveaus</h3><div class="tier-list">';n.forEach((a,s)=>{const r=t>=a.minCap&&t<a.maxCap,l=t>=a.minCap,c=r?Math.min(100,(t-a.minCap)/(a.maxCap-a.minCap)*100):l?100:0;i+=`
            <div class="tier-item ${r?"current":""} ${l?"unlocked":"locked"}">
                <div class="tier-header" style="border-left: 4px solid ${a.color}">
                    <span class="tier-icon">${a.icon}</span>
                    <div class="tier-info">
                        <span class="tier-name">${a.name}</span>
                        <span class="tier-range">${a.minCap.toLocaleString()} - ${a.maxCap<999999?a.maxCap.toLocaleString():"∞"} cap</span>
                    </div>
                    ${r?'<span class="tier-badge">Huidig</span>':""}
                </div>
                <div class="tier-progress-bar">
                    <div class="tier-progress-fill" style="width: ${c}%; background: ${a.color}"></div>
                </div>
                <div class="tier-facilities">
                    ${a.facilities.map(d=>`<span class="tier-facility ${l?"":"locked"}">${d}</span>`).join("")}
                </div>
            </div>
        `}),i+="</div>",e.innerHTML=i}function Zn(){const e=document.getElementById("stadium-birdseye");if(!e)return;const t=s=>{if(s==="grass")return o.stadium.grass&&o.stadium.grass!=="grass_0";const r=o.stadium[s];if(Array.isArray(r))return r.length>0;const l=Y[s]?.find(c=>c.id===r);return l&&l.cost>0},n=Y.tribunes.find(s=>s.id===o.stadium.tribune)||{capacity:200};let i=`
    <svg viewBox="0 0 500 350" class="stadium-svg isometric" preserveAspectRatio="xMidYMid meet">
        <defs>
            <!-- Isometric grass pattern -->
            <pattern id="isoGrass1" patternUnits="userSpaceOnUse" width="30" height="30" patternTransform="skewY(-30)">
                <rect width="15" height="30" fill="#3d9e4f"/>
                <rect x="15" width="15" height="30" fill="#35913f"/>
            </pattern>
            <pattern id="isoGrass2" patternUnits="userSpaceOnUse" width="20" height="20">
                <rect width="20" height="20" fill="#2d7a35"/>
            </pattern>
        </defs>

        <!-- Ground/surrounding area -->
        <rect x="0" y="0" width="500" height="350" fill="#4a5568"/>

        <!-- Isometric football pitch -->
        <g transform="translate(250, 80)">
            <!-- Pitch base (isometric diamond) -->
            <polygon points="0,0 180,90 0,180 -180,90" fill="#3d9e4f" stroke="#2d7a35" stroke-width="2"/>

            <!-- Grass stripes -->
            <g opacity="0.3">
                <polygon points="-150,75 -120,60 -120,120 -150,105" fill="#2d7a35"/>
                <polygon points="-90,45 -60,30 -60,150 -90,135" fill="#2d7a35"/>
                <polygon points="-30,15 0,0 0,180 -30,165" fill="#2d7a35"/>
                <polygon points="30,15 60,30 60,150 30,165" fill="#2d7a35"/>
                <polygon points="90,45 120,60 120,120 90,135" fill="#2d7a35"/>
            </g>

            <!-- Pitch lines -->
            <g fill="none" stroke="white" stroke-width="1.5" opacity="0.9">
                <!-- Outline -->
                <polygon points="0,8 172,85 0,172 -172,85"/>

                <!-- Center line -->
                <line x1="-172,85" x2="172,85" y1="0" y2="0" transform="translate(0,90)"/>
                <line x1="-86" y1="47" x2="86" y2="133"/>

                <!-- Center circle -->
                <ellipse cx="0" cy="90" rx="35" ry="17.5"/>

                <!-- Center spot -->
                <circle cx="0" cy="90" r="2" fill="white"/>

                <!-- Left penalty area -->
                <polygon points="-172,55 -120,30 -120,150 -172,125"/>

                <!-- Right penalty area -->
                <polygon points="172,55 120,30 120,150 172,125"/>

                <!-- Goals (isometric) -->
                <g transform="translate(-178, 90)">
                    <rect x="-8" y="-15" width="8" height="30" fill="none" stroke="white" stroke-width="2"/>
                </g>
                <g transform="translate(178, 90)">
                    <rect x="0" y="-15" width="8" height="30" fill="none" stroke="white" stroke-width="2"/>
                </g>
            </g>
        </g>

        <!-- Main tribune (isometric) -->
        ${Qn(n.capacity)}

        <!-- Dugouts (isometric benches) -->
        <g transform="translate(200, 255)">
            <!-- Home dugout -->
            <polygon points="0,0 30,15 30,20 0,5" fill="#5d4037"/>
            <polygon points="0,0 0,5 -5,7.5 -5,2.5" fill="#3e2723"/>
            <polygon points="30,15 30,20 25,22.5 25,17.5" fill="#8d6e63"/>
        </g>
        <g transform="translate(270, 255)">
            <!-- Away dugout -->
            <polygon points="0,0 30,15 30,20 0,5" fill="#5d4037"/>
            <polygon points="0,0 0,5 -5,7.5 -5,2.5" fill="#3e2723"/>
            <polygon points="30,15 30,20 25,22.5 25,17.5" fill="#8d6e63"/>
        </g>

        <!-- Facility buildings (isometric) - only show if built -->
        ${Xn(t)}
    </svg>`;e.innerHTML=i;const a=document.getElementById("stadium-capacity");a&&(a.textContent=n.capacity||200)}function Qn(e){const t=Math.min(6,Math.max(1,Math.ceil(e/400))),n=Math.min(200,Math.max(80,e/25));let i='<g transform="translate(250, 280)">';const a=n;for(let s=0;s<t;s++){const r=-s*6,c=(a-s*6)/2;i+=`
            <g transform="translate(0, ${r})">
                <!-- Top face -->
                <polygon points="${-c},0 0,${-c/2} ${c},0 0,${c/2}"
                         fill="${s%2===0?"#ef5350":"#e53935"}"/>
                <!-- Front face -->
                <polygon points="${-c},0 ${-c},5 0,${c/2+5} 0,${c/2}"
                         fill="#c62828"/>
                <!-- Side face -->
                <polygon points="${c},0 ${c},5 0,${c/2+5} 0,${c/2}"
                         fill="#b71c1c"/>
            </g>
        `}if(e>1e3){const s=-t*6-15;i+=`
            <g transform="translate(0, ${s})">
                <!-- Roof supports -->
                <line x1="${-n/2+10}" y1="${n/4}" x2="${-n/2+10}" y2="${n/4+30}" stroke="#424242" stroke-width="3"/>
                <line x1="${n/2-10}" y1="${-n/4}" x2="${n/2-10}" y2="${-n/4+30}" stroke="#424242" stroke-width="3"/>
                <!-- Roof -->
                <polygon points="${-n/2},5 0,${-n/4} ${n/2},5 0,${n/4+5}"
                         fill="#546e7a" opacity="0.9"/>
            </g>
        `}return i+="</g>",i}function Xn(e){const t={training:{x:50,y:120,color:"#4caf50",roofColor:"#388e3c",label:"⚽",height:20},medical:{x:50,y:180,color:"#f44336",roofColor:"#d32f2f",label:"🏥",height:18},academy:{x:50,y:240,color:"#2196f3",roofColor:"#1976d2",label:"🎓",height:25},scouting:{x:450,y:120,color:"#673ab7",roofColor:"#512da8",label:"🔭",height:18},perszaal:{x:450,y:180,color:"#607d8b",roofColor:"#455a64",label:"📺",height:22},sponsoring:{x:450,y:240,color:"#ffc107",roofColor:"#ffa000",label:"💰",height:20},horeca:{x:120,y:320,color:"#ff5722",roofColor:"#e64a19",label:"🍟",height:16,hasAwning:!0},kantine:{x:180,y:320,color:"#795548",roofColor:"#5d4037",label:"🍺",height:18},fanshop:{x:240,y:320,color:"#00bcd4",roofColor:"#0097a7",label:"👕",height:16},vip:{x:300,y:320,color:"#9c27b0",roofColor:"#7b1fa2",label:"⭐",height:24},lighting:{x:360,y:320,color:"#78909c",roofColor:"#546e7a",label:"💡",height:35,isTower:!0},parking:{x:80,y:50,color:"#455a64",roofColor:"#37474f",label:"🅿️",height:8,isFlat:!0},hotel:{x:420,y:50,color:"#8d6e63",roofColor:"#6d4c41",label:"🏨",height:35}};let n="";return Object.entries(t).forEach(([i,a])=>{if(!e(i))return;const s=28,r=14,l=a.height;a.isTower?n+=`
                <g transform="translate(${a.x}, ${a.y})" class="iso-facility" data-facility="${i}">
                    <!-- Tower base -->
                    <polygon points="0,0 8,4 8,${l+4} 0,${l}" fill="#546e7a"/>
                    <polygon points="0,0 -8,4 -8,${l+4} 0,${l}" fill="#78909c"/>
                    <!-- Light top -->
                    <ellipse cx="0" cy="-2" rx="6" ry="3" fill="#ffeb3b"/>
                    <ellipse cx="0" cy="-2" rx="3" ry="1.5" fill="#fff59d"/>
                    <!-- Label -->
                    <text x="0" y="${l+18}" text-anchor="middle" font-size="10">${a.label}</text>
                </g>
            `:a.isFlat?n+=`
                <g transform="translate(${a.x}, ${a.y})" class="iso-facility" data-facility="${i}">
                    <!-- Parking surface -->
                    <polygon points="0,0 ${s},${r} 0,${r*2} ${-s},${r}" fill="${a.color}"/>
                    <!-- Parking lines -->
                    <g stroke="white" stroke-width="1" opacity="0.5">
                        <line x1="${-s+8}" y1="${r}" x2="${s-8}" y2="${r}"/>
                        <line x1="${-s/2}" y1="${r/2}" x2="${-s/2}" y2="${r*1.5}"/>
                        <line x1="0" y1="0" x2="0" y2="${r*2}"/>
                        <line x1="${s/2}" y1="${r/2}" x2="${s/2}" y2="${r*1.5}"/>
                    </g>
                    <!-- Label -->
                    <text x="0" y="${r*2+14}" text-anchor="middle" font-size="10">${a.label}</text>
                </g>
            `:n+=`
                <g transform="translate(${a.x}, ${a.y})" class="iso-facility" data-facility="${i}">
                    <!-- Building right face -->
                    <polygon points="0,0 ${s},${r} ${s},${r+l} 0,${l}" fill="${a.color}"/>
                    <!-- Building left face -->
                    <polygon points="0,0 ${-s},${r} ${-s},${r+l} 0,${l}" fill="${a.roofColor}"/>
                    <!-- Building top/roof -->
                    <polygon points="0,${-r} ${s},0 0,${r} ${-s},0" fill="${a.roofColor}" opacity="0.8"/>
                    ${a.hasAwning?`
                        <!-- Awning -->
                        <polygon points="${-s-5},${r+l-8} 5,${l-8} 5,${l-5} ${-s-5},${r+l-5}"
                                 fill="#fff" stroke="#e0e0e0" stroke-width="0.5"/>
                        <polygon points="${-s-5},${r+l-5} 5,${l-5} 5,${l-3} ${-s-5},${r+l-3}"
                                 fill="#ff8a65"/>
                    `:""}
                    <!-- Windows (simple) -->
                    <g fill="rgba(255,255,255,0.3)">
                        <rect x="${s/2-4}" y="${r+4}" width="6" height="4" rx="0.5"/>
                        <rect x="${s/2-4}" y="${r+l/2}" width="6" height="4" rx="0.5"/>
                    </g>
                    <!-- Label -->
                    <text x="0" y="${r+l+14}" text-anchor="middle" font-size="10">${a.label}</text>
                </g>
            `}),n}const ei={veld:{name:"Veld",keys:["grass","lighting"]},tribunes:{name:"Tribunes",keys:["tribunes","vip"]},horeca:{name:"Horeca",keys:["horeca","kantine"]},winkels:{name:"Winkels",keys:["fanshop"]},training:{name:"Training",keys:["training","academy"]},medisch:{name:"Medisch",keys:["medical"]},scouting:{name:"Scouting",keys:["scouting"]},commercieel:{name:"Commercieel",keys:["sponsoring","perszaal"]},overig:{name:"Overig",keys:["parking","hotel"]}},ti={tribunes:'<svg viewBox="0 0 24 24" fill="none" stroke="#8b4513" stroke-width="2"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><rect x="9" y="12" width="6" height="9"/></svg>',grass:'<svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><path d="M4 20c2-4 4-8 8-8s6 4 8 8"/><path d="M12 4v8"/><path d="M8 8c2 0 4 2 4 4"/><path d="M16 8c-2 0-4 2-4 4"/></svg>',horeca:'<svg viewBox="0 0 24 24" fill="none" stroke="#ff7043" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20h16l-2-8H6l-2 8z"/></svg>',fanshop:'<svg viewBox="0 0 24 24" fill="none" stroke="#00bcd4" stroke-width="2"><path d="M6 4h12l2 5H4l2-5z"/><path d="M4 9v11h16V9"/><path d="M9 9v11M15 9v11"/></svg>',vip:'<svg viewBox="0 0 24 24" fill="none" stroke="#9c27b0" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12l2 4 2-4M15 10v6M17 10l-2 3 2 3"/></svg>',parking:'<svg viewBox="0 0 24 24" fill="none" stroke="#607d8b" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 16V8h4a3 3 0 010 6H9"/></svg>',lighting:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffeb3b" stroke-width="2"><circle cx="12" cy="6" r="4"/><path d="M12 10v10M8 20h8"/></svg>',training:'<svg viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg>',medical:'<svg viewBox="0 0 24 24" fill="none" stroke="#f44336" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M12 8v8M8 12h8"/></svg>',academy:'<svg viewBox="0 0 24 24" fill="none" stroke="#2196f3" stroke-width="2"><path d="M12 3l9 4.5v9L12 21l-9-4.5v-9L12 3z"/><path d="M12 12v9M12 12L3 7.5M12 12l9-4.5"/></svg>',scouting:'<svg viewBox="0 0 24 24" fill="none" stroke="#1565c0" stroke-width="2"><circle cx="10" cy="10" r="6"/><path d="M14 14l6 6"/></svg>',sponsoring:'<svg viewBox="0 0 24 24" fill="none" stroke="#ffc107" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 6v2M12 16v2M9 9c0-1 1-2 3-2s3 1 3 2-1 2-3 2-3 1-3 2 1 2 3 2 3-1 3-2"/></svg>',kantine:'<svg viewBox="0 0 24 24" fill="none" stroke="#8d6e63" stroke-width="2"><path d="M4 11h16M4 11V8a4 4 0 014-4h8a4 4 0 014 4v3M4 11v9h16v-9"/></svg>',perszaal:'<svg viewBox="0 0 24 24" fill="none" stroke="#37474f" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 18v3"/></svg>',hotel:'<svg viewBox="0 0 24 24" fill="none" stroke="#795548" stroke-width="2"><path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/><rect x="8" y="6" width="3" height="3"/><rect x="13" y="6" width="3" height="3"/><rect x="8" y="11" width="3" height="3"/><rect x="13" y="11" width="3" height="3"/><rect x="10" y="16" width="4" height="5"/></svg>'};let xt="veld";function ni(){document.querySelectorAll(".upgrade-tab").forEach(e=>{e.addEventListener("click",()=>{xt=e.dataset.category,document.querySelectorAll(".upgrade-tab").forEach(t=>t.classList.remove("active")),e.classList.add("active"),wt()})})}function wt(){const e=document.getElementById("stadium-upgrades-content");if(!e)return;const t=Y.tribunes.find(s=>s.id===o.stadium.tribune)?.capacity||200,n=ei[xt];if(!n)return;const i=["tribunes","grass","training","medical","academy","scouting","lighting","sponsoring","kantine","perszaal","hotel"];let a="";n.keys.forEach(s=>{const r=Y[s];if(!r)return;const l=s==="tribunes"?o.stadium.tribune:i.includes(s)?o.stadium[s]:null,c=Array.isArray(o.stadium[s])?o.stadium[s]:[];r.forEach(d=>{const u=l===d.id,f=c.includes(d.id),m=d.required>t,p=o.club.budget>=d.cost;let h="",g="";u||f?(h="owned",g='<span class="upgrade-status">Gebouwd</span>'):m?(h="locked",g=`<span class="upgrade-price">${d.required}+ cap</span>`):p?(h="",g=`<span class="upgrade-price">${b(d.cost)}</span><button class="btn-build" data-category="${s}" data-upgrade="${d.id}">Bouwen</button>`):(h="",g=`<span class="upgrade-price">${b(d.cost)}</span><button class="btn-build" disabled>Te duur</button>`);let x="";d.capacity?x=`${d.capacity} plaatsen`:d.income?x=`+${b(d.income)}/bezoeker`:d.dailyIncome?x=`+${b(d.dailyIncome)}/dag`:d.multiplier?x=`${d.multiplier}x groei`:d.effect&&(x=d.effect),a+=`
                <div class="stadium-upgrade-item ${h}" data-facility="${s}">
                    <div class="upgrade-icon">${ti[s]||""}</div>
                    <div class="upgrade-info">
                        <h5>${d.name}</h5>
                        <p>${x}</p>
                    </div>
                    <div class="upgrade-action">${g}</div>
                </div>
            `})}),e.innerHTML=a||'<p style="color: var(--text-muted); text-align: center;">Geen upgrades beschikbaar</p>',e.querySelectorAll(".btn-build:not([disabled])").forEach(s=>{s.addEventListener("click",r=>{r.stopPropagation(),ii(s.dataset.category,s.dataset.upgrade)})}),e.querySelectorAll(".stadium-upgrade-item").forEach(s=>{const r=s.dataset.facility;s.addEventListener("mouseenter",()=>Qe(r,!0)),s.addEventListener("mouseleave",()=>Qe(r,!1))})}function Qe(e,t){const i={horeca:"facility-horeca",fanshop:"facility-fanshop",vip:"facility-vip",parking:"facility-parking",training:"facility-training",medical:"facility-medical",academy:"facility-academy",scouting:"facility-scouting",lighting:"facility-lighting",sponsoring:"facility-sponsoring",kantine:"facility-kantine",perszaal:"facility-perszaal",hotel:"facility-hotel",grass:"facility-grass",tribunes:"facility-tribune"}[e];if(!i)return;const a=document.getElementById(i);a&&(t?a.classList.add("preview-highlight"):a.classList.remove("preview-highlight"))}function ii(e,t){const i=Y[e]?.find(a=>a.id===t);!i||o.club.budget<i.cost||confirm(`Wil je ${i.name} bouwen voor ${b(i.cost)}?`)&&(o.club.budget-=i.cost,["tribunes","grass","training","medical","academy","scouting","lighting","sponsoring","kantine","perszaal","hotel"].includes(e)?(o.stadium[e==="tribunes"?"tribune":e]=t,e==="tribunes"&&(o.stadium.capacity=i.capacity)):(Array.isArray(o.stadium[e])||(o.stadium[e]=[]),o.stadium[e].push(t)),P(),bt())}let Te=!1;function ie(){const e=document.getElementById("scout-results"),t=document.getElementById("results-count");document.getElementById("scout-empty");const n=document.getElementById("scout-budget"),i=document.getElementById("scout-hire-card"),a=document.getElementById("scout-interface"),s=o.hiredStaff?.medisch?.includes("st_scout");if(i&&(i.style.display=s?"none":"flex"),a&&(a.style.display=s?"grid":"none"),n&&(n.textContent=b(o.club.budget)),!e)return;const r=o.scoutSearch.results;if(t&&(t.textContent=`${r.length} speler${r.length!==1?"s":""} gevonden`),r.length===0){e.innerHTML=`
            <div class="scout-empty-state" id="scout-empty">
                <div class="empty-icon">🔍</div>
                <h4>Geen rapporten</h4>
                <p>Stuur je scout op pad om talent te vinden</p>
            </div>
        `;return}let l=`
        <div class="scout-info-box">
            <div class="scout-info-icon">💡</div>
            <div class="scout-info-content">
                <strong>Hoe werkt scouten?</strong>
                <ul>
                    <li><strong>🔍 Opnieuw scouten</strong> = smallere ranges, meer zekerheid (kost geld)</li>
                    <li><strong>✕ Afwijzen</strong> = speler verdwijnt, morgen nieuwe kans</li>
                    <li>Durf je te gokken of wil je zekerheid?</li>
                </ul>
            </div>
        </div>
    `;r.forEach(c=>{const d=c.price===0?"Transfervrij":b(c.price),u=c.price===0?"free":"",f=c.scoutRanges||{overall:{min:c.overall-3,max:c.overall+3},potential:{min:c.potential-5,max:c.potential+5},attack:{min:c.attack-25,max:c.attack+25},defense:{min:c.defense-25,max:c.defense+25},speed:{min:c.speed-25,max:c.speed+25},stamina:{min:c.stamina-25,max:c.stamina+25}},m=c.scoutCount||1,p=He(m),h=m>=5,g=M=>{const A=Math.max(1,M.min),T=Math.min(99,M.max),j=(A+T)/2,N=Math.round(j/20*2)/2;return Math.min(5,Math.max(0,N))},x=M=>{let A="";const T=Math.floor(M),j=M%1!==0,N=5-T-(j?1:0);for(let z=0;z<T;z++)A+='<span class="star full">★</span>';j&&(A+='<span class="star half">★</span>');for(let z=0;z<N;z++)A+='<span class="star empty">☆</span>';return A},k=(M,A)=>{const T=Math.max(1,A.min),j=Math.min(99,A.max),N=j-T;return`
                <div class="scout-attr-range">
                    <span class="scout-attr-label">${M}</span>
                    <div class="scout-range-bar">
                        <div class="scout-range-track">
                            <div class="scout-range-fill" style="left: ${T}%; width: ${N}%"></div>
                        </div>
                        <span class="scout-range-value">${T}-${j}</span>
                    </div>
                </div>
            `},v=g(f.potential),$=v>=5;l+=`
            <div class="scout-result-card" data-player-id="${c.id}">
                <div class="scout-result-header" style="background: ${S[c.position].color}">
                    <div class="scout-header-top">
                        <span class="scout-count-badge" title="${m}x gescout">🔍 ${m}x</span>
                        <span class="scout-result-position">${S[c.position].abbr}</span>
                        <span class="scout-result-flag">${c.nationality.flag}</span>
                    </div>
                    <div class="scout-ratings">
                        <div class="scout-rating">
                            <span class="scout-rating-range">${f.overall.min}-${f.overall.max}</span>
                            <span class="scout-rating-label">ALG</span>
                        </div>
                        <div class="scout-rating potential ${$?"star-player":""}">
                            <span class="scout-stars">${x(v)}</span>
                            <span class="scout-rating-label">${$?"⭐ STER":"POT"}</span>
                        </div>
                    </div>
                </div>
                <div class="scout-result-body">
                    <span class="scout-result-name">${c.name}</span>
                    <span class="scout-result-age">${c.age} jaar</span>

                    <div class="scout-attributes-ranges">
                        ${k("AAN",f.attack)}
                        ${k("VER",f.defense)}
                        ${k("SNE",f.speed)}
                        ${k("CON",f.stamina)}
                    </div>

                    <div class="scout-result-actions">
                        <div class="scout-price-row">
                            <span class="scout-result-price ${u}">${d}</span>
                        </div>
                        <div class="scout-buttons">
                            <button class="btn btn-dismiss" data-player-id="${c.id}" title="Niet interessant - morgen nieuwe speler">
                                ✕
                            </button>
                            ${h?`
                                <span class="scout-maxed">✓ Volledig</span>
                            `:`
                                <button class="btn btn-secondary btn-rescout" data-player-id="${c.id}" title="Nogmaals scouten voor meer zekerheid">
                                    🔍 ${b(p)}
                                </button>
                            `}
                            <button class="btn btn-primary btn-scout-hire" data-player-id="${c.id}">
                                Aannemen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `}),e.innerHTML=l,document.querySelectorAll(".btn-scout-hire").forEach(c=>{c.addEventListener("click",d=>{d.stopPropagation();const u=parseFloat(c.dataset.playerId);ai(u)})}),document.querySelectorAll(".btn-rescout").forEach(c=>{c.addEventListener("click",d=>{d.stopPropagation();const u=parseFloat(c.dataset.playerId),f=jn(u);f.success||alert(f.message)})}),document.querySelectorAll(".btn-dismiss").forEach(c=>{c.addEventListener("click",d=>{d.stopPropagation();const u=parseFloat(c.dataset.playerId);Rn(u)})})}function ai(e){const t=o.scoutSearch.results.find(n=>n.id===e);if(t){if(t.price>o.club.budget){alert("Je hebt niet genoeg budget!");return}o.club.budget-=t.price,o.players.push(t),o.scoutSearch.results=o.scoutSearch.results.filter(n=>n.id!==e),P(),ie(),alert(`${t.name} is toegevoegd aan je selectie!`)}}function si(){if(Te)return;const e=document.getElementById("scout-search-btn"),t=document.getElementById("scout-status"),n=document.getElementById("scout-min-age"),i=document.getElementById("scout-max-age"),a=document.getElementById("scout-position"),s=parseInt(n?.value)||16,r=parseInt(i?.value)||35,l=a?.value||"all";Te=!0,e&&(e.classList.add("scouting"),e.innerHTML='<span class="btn-scout-icon">⏳</span><span class="btn-scout-text">Scouten...</span>'),t&&(t.classList.add("active"),t.innerHTML=`
            <p class="scout-status-text">Scout is onderweg...</p>
            <div class="scout-progress">
                <div class="scout-progress-fill" id="scout-progress-fill" style="width: 0%"></div>
            </div>
        `);let c=0;const d=2e3,u=50,f=d/u,m=setInterval(()=>{c+=100/f;const p=document.getElementById("scout-progress-fill");p&&(p.style.width=`${Math.min(c,100)}%`)},u);setTimeout(()=>{clearInterval(m),Te=!1,o.scoutSearch.minAge=s,o.scoutSearch.maxAge=r,o.scoutSearch.position=l,o.scoutSearch.results=Pn(l,s,r,3),e&&(e.classList.remove("scouting"),e.innerHTML='<span class="btn-scout-icon">🔍</span><span class="btn-scout-text">Scout Versturen</span>'),t&&(t.classList.remove("active"),t.innerHTML=`<p class="scout-status-text">${o.scoutSearch.results.length} spelers gevonden!</p>`),ie()},d)}function oi(){const e=document.getElementById("scout-search-btn"),t=document.getElementById("scout-min-age"),n=document.getElementById("scout-max-age"),i=document.getElementById("age-range-display");e&&e.addEventListener("click",si);function a(){if(i&&t&&n){const s=t.value,r=n.value;i.textContent=`${s} - ${r}`}}t&&t.addEventListener("input",a),n&&n.addEventListener("input",a)}const Ke={aan:{name:"Aanvalstrainer",stat:"AAN",color:"#c62828"},ver:{name:"Verdedigingstrainer",stat:"VER",color:"#1565c0"},sne:{name:"Snelheidstrainer",stat:"SNE",color:"#ef6c00"},fys:{name:"Fitnesstrainer",stat:"FYS",color:"#7b1fa2"}},Xe={goalkeeper:"Keeper",defender:"Verdediger",midfielder:"Middenvelder",attacker:"Aanvaller"};function we(){ri(),kt(),Mt(),ci()}function ri(){const e=document.querySelectorAll(".training-tab"),t=document.querySelectorAll(".training-panel");e.forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.trainingTab;e.forEach(a=>a.classList.remove("active")),n.classList.add("active"),t.forEach(a=>{a.classList.remove("active"),a.id===`${i}-training-panel`&&a.classList.add("active")})})})}const je=[{id:"keeper",name:"Keeper",icon:"🧤",trainerId:"tr_keeper",positions:["keeper"]},{id:"verdediging",name:"Verdediging",icon:"🛡️",trainerId:"tr_verdediging",positions:["cb","lb","rb"]},{id:"middenveld",name:"Middenveld",icon:"⚙️",trainerId:"tr_middenveld",positions:["cdm","cm","cam","lm","rm"]},{id:"aanval",name:"Aanval",icon:"⚽",trainerId:"tr_aanval",positions:["lw","rw","cf","st"]}];function kt(){const e=document.getElementById("position-training-grid");if(!e)return;o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]});let t="";je.forEach(i=>{const a=o.hiredStaff.trainers?.includes(i.trainerId),s=o.players.filter(r=>i.positions.includes(r.position));t+=`
            <div class="position-train-card ${a?"has-trainer":"locked"}">
                <div class="ptc-icon">${i.icon}</div>
                <div class="ptc-name">${i.name}</div>
                <div class="ptc-players">${s.length} spelers</div>
                <div class="ptc-status ${a?"has-trainer":"no-trainer"}">
                    ${a?"✓ Trainer beschikbaar":"✗ Geen trainer"}
                </div>
                ${a?`
                    <button class="btn btn-sm btn-primary" onclick="openPositionTrainingModal('${i.id}')">
                        Train
                    </button>
                `:`
                    <button class="btn btn-sm btn-secondary" onclick="navigateTo('staff')">
                        Neem trainer aan
                    </button>
                `}
            </div>
        `}),e.innerHTML=t;const n=document.querySelector(".training-hint");if(n){const i=je.some(a=>o.hiredStaff.trainers?.includes(a.trainerId));n.style.display=i?"none":"block"}}window.openPositionTrainingModal=function(e){const t=je.find(s=>s.id===e);if(!t)return;const n=o.players.filter(s=>t.positions.includes(s.position));if(n.length===0){E("Geen spelers beschikbaar voor deze positie","warning");return}const i=document.createElement("div");i.className="modal-overlay",i.id="position-training-modal";let a=n.map(s=>`
        <div class="training-player-option" onclick="trainPlayer('${s.id}', '${e}')">
            <div class="tpo-pos">${s.position.toUpperCase()}</div>
            <div class="tpo-name">${s.name}</div>
            <div class="tpo-overall">${s.overall}</div>
            <div class="tpo-condition" style="color: ${s.condition>=70?"var(--accent-green)":"var(--error)"}">
                ${s.condition}%
            </div>
        </div>
    `).join("");i.innerHTML=`
        <div class="modal-backdrop" onclick="closePositionTrainingModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closePositionTrainingModal()">&times;</button>
            <h3>Train ${t.name}</h3>
            <p class="modal-subtitle">Selecteer een speler om te trainen</p>
            <div class="training-player-list">
                ${a}
            </div>
        </div>
    `,document.body.appendChild(i),requestAnimationFrame(()=>i.classList.add("active"))};window.closePositionTrainingModal=function(){const e=document.getElementById("position-training-modal");e&&(e.classList.remove("active"),setTimeout(()=>e.remove(),200))};window.trainPlayer=function(e,t){const n=o.players.find(r=>r.id===e);if(!n)return;const i=["speed","physical","technique","attack","defense"],a=i[Math.floor(Math.random()*i.length)],s=Math.floor(Math.random()*3)+1;n[a]!==void 0&&(n[a]=Math.min(99,n[a]+s),n.overall=Math.floor((n.attack+n.defense+n.speed+n.physical)/4)),n.condition=Math.max(0,n.condition-10),closePositionTrainingModal(),F(),E(`${n.name} getraind! +${s} ${a}`,"success"),kt()};const li={1:{name:"Heel Rustig",condition:2,energy:-1,desc:"Lichte hersteltraining. Ideaal na zware wedstrijden."},2:{name:"Rustig",condition:4,energy:-2,desc:"Lichte training met focus op herstel en techniek."},3:{name:"Normaal",condition:5,energy:-3,desc:"Gebalanceerde training voor stabiele ontwikkeling."},4:{name:"Intens",condition:7,energy:-5,desc:"Zware training. Verbetert conditie snel maar kost energie."},5:{name:"Bruut Intens",condition:10,energy:-8,desc:"Extreme training! Maximale conditiegroei maar uitputtend."}};function ci(){const e=document.getElementById("training-intensity");e&&(o.training.intensity||(o.training.intensity=3),e.value=o.training.intensity,et(o.training.intensity),e.addEventListener("input",t=>{const n=parseInt(t.target.value);o.training.intensity=n,et(n)}))}function et(e){const t=li[e];if(!t)return;const n=document.getElementById("intensity-condition");n&&(n.textContent=`+${t.condition}%`);const i=document.getElementById("intensity-energy");i&&(i.textContent=`${t.energy}%`);const a=document.getElementById("intensity-description");a&&(a.innerHTML=`<strong>${t.name}</strong> - ${t.desc}`),document.querySelectorAll(".intensity-step").forEach(s=>{const r=parseInt(s.dataset.level);s.classList.toggle("active",r<=e)})}function di(){const e=document.getElementById("assistant-grid");if(!e)return;let t="";Object.entries(rt).forEach(([n,i])=>{const a=o.assistantTrainers[n]!==null,s=o.club.budget>=i.cost;a?t+=`
                <div class="assistant-card hired">
                    <div class="assistant-icon">${i.icon}</div>
                    <div class="assistant-name">${i.name}</div>
                    <div class="assistant-effect">${i.effect}</div>
                    <div class="assistant-hired">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        Actief
                    </div>
                    <div class="assistant-salary">${b(i.weeklySalary)}/week</div>
                </div>
            `:t+=`
                <div class="assistant-card ${s?"":"locked"}" onclick="${s?`hireAssistant('${n}')`:""}">
                    <div class="assistant-icon">${i.icon}</div>
                    <div class="assistant-name">${i.name}</div>
                    <div class="assistant-effect">${i.effect}</div>
                    <div class="assistant-cost">${b(i.cost)}</div>
                    <div class="assistant-salary">+ ${b(i.weeklySalary)}/week</div>
                </div>
            `}),e.innerHTML=t}function ui(e){const t=rt[e];if(t){if(o.club.budget<t.cost){alert("Niet genoeg budget!");return}if(o.assistantTrainers[e]!==null){alert("Deze assistent is al in dienst!");return}o.club.budget-=t.cost,o.assistantTrainers[e]={hiredAt:Date.now(),weeklySalary:t.weeklySalary},P(),di(),console.log(`✅ ${t.name} ingehuurd!`)}}function fi(){const e=document.getElementById("staff-panel"),t=document.getElementById("staff-grid"),n=document.getElementById("staff-unlock-info");if(!e||!t||!n)return;const i=o.club.division;if(!(i<=5)){n.textContent=`🔒 Beschikbaar vanaf 3e Klasse (nog ${5-i} divisie${5-i>1?"s":""} te gaan)`,n.classList.add("locked"),t.innerHTML="";let r="";Object.entries(Be).forEach(([l,c])=>{r+=`
                <div class="staff-card locked">
                    <div class="staff-icon">${c.icon}</div>
                    <div class="staff-name">${c.name}</div>
                    <div class="staff-desc">${c.description}</div>
                    <div class="staff-effect">${c.effect}</div>
                </div>
            `}),t.innerHTML=r;return}n.textContent="Huur stafleden in om je club te verbeteren",n.classList.remove("locked");let s="";Object.entries(Be).forEach(([r,l])=>{if(o.staff[r]!==null)s+=`
                <div class="staff-card hired">
                    <div class="staff-icon">${l.icon}</div>
                    <div class="staff-name">${l.name}</div>
                    <div class="staff-desc">${l.description}</div>
                    <div class="staff-effect">${l.effect}</div>
                    <div class="staff-hired-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 6L9 17l-5-5"/>
                        </svg>
                        In dienst
                    </div>
                    <div class="staff-salary">${b(l.weeklySalary)}/week</div>
                </div>
            `;else{const d=o.club.budget>=l.cost;s+=`
                <div class="staff-card ${d?"":"locked"}" onclick="${d?`hireStaff('${r}')`:""}">
                    <div class="staff-icon">${l.icon}</div>
                    <div class="staff-name">${l.name}</div>
                    <div class="staff-desc">${l.description}</div>
                    <div class="staff-effect">${l.effect}</div>
                    <div class="staff-cost">${b(l.cost)} eenmalig</div>
                    <div class="staff-salary">+ ${b(l.weeklySalary)}/week</div>
                    <button class="btn btn-primary btn-small" ${d?"":"disabled"}>
                        ${d?"Inhuren":"Te duur"}
                    </button>
                </div>
            `}}),t.innerHTML=s}function mi(e){const t=Be[e];if(t){if(o.club.budget<t.cost){alert("Niet genoeg budget!");return}if(o.staff[e]!==null){alert("Deze stafrol is al ingevuld!");return}o.club.budget-=t.cost,o.staff[e]={hiredAt:Date.now(),weeklySalary:t.weeklySalary},P(),fi(),console.log(`✅ ${t.name} ingehuurd!`)}}function St(){Object.keys(Ke).forEach(e=>{const t=document.getElementById(`train-player-${e}`),n=document.getElementById(`train-timer-${e}`),i=document.querySelector(`.trainer-card[data-trainer="${e}"]`),a=i?.querySelector(".tc-btn");if(!t||!n||!i||!a)return;const s=o.training.trainerStatus[e];if(s.busy&&s.playerId){const r=o.players.find(c=>c.id===s.playerId),l=pi(e);t.textContent=r?r.name.split(" ")[0]:"-",t.classList.add("has-player"),n.textContent=_e(l),n.classList.add("counting"),i.classList.add("training"),a.textContent="Annuleren",a.onclick=()=>vi(e)}else t.textContent="-",t.classList.remove("has-player"),n.textContent="",n.classList.remove("counting"),i.classList.remove("training"),a.textContent="Speler toewijzen",a.onclick=()=>hi(e)})}function pi(e){const t=o.training.trainerStatus[e];if(!t.startTime)return 0;const n=Date.now()-t.startTime;return Math.max(0,o.training.sessionDuration-n)}let he=null;function hi(e){he=e;const t=Ke[e],n=Object.values(o.training.trainerStatus).filter(u=>u.busy&&u.playerId).map(u=>u.playerId),i=o.players.filter(u=>!n.includes(u.id));if(i.length===0){alert("Geen spelers beschikbaar voor training.");return}const a=t.stat;i.sort((u,f)=>(f.attributes[a]||0)-(u.attributes[a]||0));const s=document.getElementById("training-select-modal"),r=document.getElementById("training-modal-title"),l=document.getElementById("training-modal-subtitle"),c=document.getElementById("training-player-list");r.textContent=`${a} Training`,l.textContent=`Selecteer een speler om ${t.name} te trainen`;let d="";i.forEach(u=>{const f=S[u.position]||{abbr:"??",color:"#666"};u.photo||ve(u.name,u.position);const m=u.attributes[a]||0,p=vt(u.potential,u.age);d+=`
            <div class="training-player-card" onclick="selectTrainingPlayer(${u.id})">
                <div class="tpc-ratings">
                    <div class="tpc-overall" style="background: ${f.color}">
                        <span class="tpc-overall-val">${u.overall}</span>
                        <span class="tpc-overall-lbl">OVR</span>
                    </div>
                    <div class="tpc-potential" style="background: ${f.color}; opacity: 0.85">
                        <span class="tpc-potential-val">${p}</span>
                        <span class="tpc-potential-lbl">POT</span>
                    </div>
                </div>
                <div class="tpc-info">
                    <span class="tpc-name">${u.name}</span>
                    <div class="tpc-meta">
                        <span class="tpc-flag">${u.nationality.flag}</span>
                        <span class="tpc-pos" style="background: ${f.color}">${f.abbr}</span>
                        <span class="tpc-age">${u.age}j</span>
                    </div>
                </div>
                <div class="tpc-stat">
                    <div class="tpc-stat-value">${m}</div>
                    <div class="tpc-stat-label">${a}</div>
                </div>
            </div>
        `}),c.innerHTML=d,s.classList.add("active")}function Et(){document.getElementById("training-select-modal").classList.remove("active"),he=null}function gi(e){he&&(yi(he,e),Et())}function yi(e,t){o.training.trainerStatus[e]={busy:!0,playerId:t,startTime:Date.now()},St()}function vi(e){o.training.trainerStatus[e]={busy:!1},St()}function Mt(){document.querySelectorAll(".team-training-option").forEach(t=>{const n=t.dataset.type,i=t.querySelector("button");o.training.teamTraining.selected===n?(t.classList.add("selected"),i.textContent="Geselecteerd",i.classList.add("btn-primary"),i.classList.remove("btn-secondary")):(t.classList.remove("selected"),i.textContent="Selecteer",i.classList.remove("btn-primary"),i.classList.add("btn-secondary"))})}function bi(){Object.keys(o.training.slots).forEach(e=>{const t=o.training.slots[e];if(t.playerId&&t.startTime){const n=xi(e),i=document.querySelector(`.tp-timer[data-slot="${e}"]`);n<=0?Ei(e):i&&(i.textContent=_e(n))}})}function xi(e){const t=o.training.slots[e];if(!t.startTime)return 0;const n=Date.now()-t.startTime;return Math.max(0,o.training.sessionDuration-n)}function wi(e){const t=o.players.filter(s=>{const r=S[s.position];return!r||r.group!==e?!1:!Object.values(o.training.slots).some(c=>c.playerId===s.id)});if(t.length===0){alert(`Geen ${Xe[e].toLowerCase()}s beschikbaar voor training.`);return}const n=Object.entries(o.training.trainerStatus).find(([s,r])=>!r.busy);if(!n){alert("Alle trainers zijn momenteel bezet.");return}const i=t.map((s,r)=>`${r+1}. ${s.name} (${s.overall})`).join(`
`),a=prompt(`Selecteer een ${Xe[e].toLowerCase()} om te trainen:

${i}

Voer het nummer in:`);if(a){const s=parseInt(a)-1;s>=0&&s<t.length&&ki(e,t[s].id,n[0])}}function ki(e,t,n){o.training.slots[e]={playerId:t,startTime:Date.now(),trainerId:n},o.training.trainerStatus[n]={busy:!0,assignedSlot:e},we()}function Si(e){const t=o.training.slots[e];t.trainerId&&(o.training.trainerStatus[t.trainerId]={busy:!1,assignedSlot:null}),$t(e),we()}function $t(e){o.training.slots[e]={playerId:null,startTime:null,trainerId:null}}function Ei(e){const t=o.training.slots[e],n=o.players.find(a=>a.id===t.playerId),i=Ke[t.trainerId];n&&i&&(n.attributes[i.stat]=Math.min(99,n.attributes[i.stat]+1),n.overall=gt(n.attributes,n.position),alert(`Training voltooid! ${n.name} heeft +1 ${i.stat} gekregen.`)),t.trainerId&&(o.training.trainerStatus[t.trainerId]={busy:!1,assignedSlot:null}),$t(e),we(),X()}function Mi(e){o.training.teamTraining.selected=e;const t={defense:{type:"defense",value:10},setpiece:{type:"setpiece",value:10},attack:{type:"attack",value:10}};o.training.teamTraining.bonus=t[e],Mt()}window.openPlayerSelectModal=wi;window.cancelTraining=Si;window.selectTeamTraining=Mi;window.hireStaff=mi;window.hireAssistant=ui;window.closeTrainingModal=Et;window.selectTrainingPlayer=gi;function $i(){const e=o.nextMatch.time-Date.now(),t=document.getElementById("timer-hours"),n=document.getElementById("timer-minutes"),i=document.getElementById("timer-seconds");if(t&&n&&i)if(e<=0){t.textContent="00",n.textContent="00",i.textContent="00";const s=document.getElementById("play-match-btn");s&&s.classList.add("match-ready")}else{const s=Math.floor(e/36e5),r=Math.floor(e%(1e3*60*60)/(1e3*60)),l=Math.floor(e%(1e3*60)/1e3);t.textContent=String(s).padStart(2,"0"),n.textContent=String(r).padStart(2,"0"),i.textContent=String(l).padStart(2,"0")}const a=document.getElementById("match-timer");a&&!t&&(a.textContent=e<=0?"Nu spelen!":_e(e))}function Ti(e){const t=o.players.find(m=>m.id===e);if(!t)return;const n=document.getElementById("player-modal"),i=document.getElementById("player-detail-content"),a=Q.good.includes(t.personality)?"good":Q.bad.includes(t.personality)?"bad":"",s=be(t,o.club.division),r=Math.round(s*.5),l=Math.round(s*2.5),c=s;i.innerHTML=`
        <div class="player-detail-header">
            <div class="player-detail-avatar" style="background: ${S[t.position].color}">${Gt(t.name)}</div>
            <div class="player-detail-info">
                <h2>${t.name} ${t.nationality.flag}</h2>
                <div class="player-detail-meta">
                    <span>${t.age} jaar</span>
                    <span>${S[t.position].name}</span>
                    <span>Overall: ${t.overall}</span>
                    <span>Potentieel: ${t.potential}</span>
                </div>
            </div>
        </div>

        <div class="player-detail-personality">
            <h4>Persoonlijkheid</h4>
            <span class="personality-badge ${a}">${t.personality}</span>
        </div>

        <div class="player-detail-stats">
            <div class="stat-box">
                <span class="stat-value">${t.goals}</span>
                <span class="stat-label">Doelpunten</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${t.assists}</span>
                <span class="stat-label">Assists</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${t.morale}%</span>
                <span class="stat-label">Moraal</span>
            </div>
            <div class="stat-box">
                <span class="stat-value">${b(t.salary)}</span>
                <span class="stat-label">Salaris/week</span>
            </div>
        </div>

        <div class="player-transfer-section">
            <h4>Zet op Transfermarkt</h4>
            <div class="transfer-price-setting">
                <input type="range" class="transfer-price-slider" id="transfer-list-price"
                       min="${r}" max="${l}" value="${c}" step="100">
                <span class="transfer-price-display" id="transfer-list-price-display">${b(c)}</span>
            </div>
            <div class="transfer-price-info">
                <span>Min: ${b(r)} (0.5x)</span>
                <span>Marktwaarde: ${b(s)}</span>
                <span>Max: ${b(l)} (2.5x)</span>
            </div>
            <button class="btn-list-transfer" data-player-id="${t.id}">
                Zet op Transfermarkt
            </button>
        </div>
    `;const d=document.getElementById("transfer-list-price"),u=document.getElementById("transfer-list-price-display");d&&u&&d.addEventListener("input",()=>{u.textContent=b(parseInt(d.value))});const f=i.querySelector(".btn-list-transfer");f&&f.addEventListener("click",()=>{const m=parseInt(d.value);Ci(e,m)}),n.classList.add("active")}function Ci(e,t){const n=o.players.findIndex(a=>a.id===e);if(n===-1)return;const i=o.players[n];confirm(`Wil je ${i.name} op de transfermarkt zetten voor ${b(t)}?`)&&(o.players.splice(n,1),i.price=t,i.listedByPlayer=!0,o.transferMarket.players.push(i),document.getElementById("player-modal").classList.remove("active"),X(),alert(`${i.name} staat nu op de transfermarkt voor ${b(t)}!`))}function Re(e){document.querySelectorAll(".nav-item").forEach(n=>n.classList.remove("active")),document.querySelector(`.nav-item[data-page="${e}"]`)?.classList.add("active"),document.querySelectorAll(".page").forEach(n=>n.classList.remove("active")),document.getElementById(e)?.classList.add("active");const t=document.querySelector(".main-content");t&&(t.scrollTop=0),window.scrollTo(0,0),e==="squad"&&X(),e==="tactics"&&qn(),e==="training"&&we(),e==="stadium"&&bt(),e==="scout"&&ie(),e==="transfers"&&J(),e==="finances"&&ua(),e==="sponsors"&&Ya(),e==="activities"&&Ja(),e==="staff"&&Nt(),e==="mijnteam"&&Tt(),e==="jeugdteam"&&aa(),e==="kantine"&&ls()}function Ai(){document.querySelectorAll(".nav-item").forEach(i=>{i.addEventListener("click",a=>{a.target.closest(".nav-submenu")||(Re(i.dataset.page),document.querySelector(".sidebar")?.classList.remove("sidebar-open"),document.getElementById("sidebar-overlay")?.classList.remove("active"),document.getElementById("hamburger-btn")?.classList.remove("active"))})}),document.querySelectorAll(".nav-submenu li").forEach(i=>{i.addEventListener("click",a=>{a.stopPropagation();const r=i.closest(".nav-item").dataset.page,l=i.dataset.tab;Re(r),setTimeout(()=>{Ii(r,l)},50)})});const e=document.getElementById("hamburger-btn"),t=document.querySelector(".sidebar"),n=document.getElementById("sidebar-overlay");e&&e.addEventListener("click",()=>{t.classList.toggle("sidebar-open"),n.classList.toggle("active"),e.classList.toggle("active")}),n&&n.addEventListener("click",()=>{t.classList.remove("sidebar-open"),n.classList.remove("active"),e&&e.classList.remove("active")})}function Ii(e,t){let n;if(e==="tactics"){n=".tactics-tab";const i=document.querySelector(`${n}[data-tab="${t}"]`);i&&i.click()}else if(e==="training"){n=".training-tab";const i=document.querySelector(`${n}[data-training-tab="${t}"]`);i&&i.click()}else if(e==="staff"){n=".staff-tab";const i=document.querySelector(`${n}[data-staff-tab="${t}"]`);i&&i.click()}}function Bi(){const e={training:"training",lineup:"tactics",scout:"scout",stadium:"stadium"};document.querySelectorAll(".quick-action").forEach(t=>{t.addEventListener("click",()=>{const n=t.dataset.action,i=e[n];i&&Re(i)})})}function Li(){document.querySelectorAll(".filter-btn").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".filter-btn").forEach(t=>t.classList.remove("active")),e.classList.add("active"),X()})})}function Di(){document.querySelectorAll(".modal-close, .modal-backdrop").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".modal").forEach(t=>t.classList.remove("active"))})})}function Pi(){const e=document.getElementById("execute-training-btn");e&&e.addEventListener("click",executeTraining)}function P(){const e=o.club.budget,t=b(e);document.querySelectorAll(".budget-display, .budget-value").forEach(s=>{s.textContent=t});const n=document.getElementById("header-budget");n&&(n.textContent=t);const i=document.getElementById("global-budget-display"),a=document.getElementById("global-budget-amount");i&&a&&(a.textContent=t,i.classList.remove("low-budget","high-budget"),e<1e3?i.classList.add("low-budget"):e>2e4&&i.classList.add("high-budget"),i.classList.remove("budget-changed"),i.offsetWidth,i.classList.add("budget-changed"))}function ji(){setInterval(()=>{bi()},1e3),setInterval($i,1e3)}function tt(){const e=[],t=o.club.division,n=y(10,20);for(let i=0;i<n;i++){const a=L(t);Math.random()<.2?(a.price=0,a.signingBonus=Math.round(a.salary*52*.3),a.isFreeAgent=!0):(a.price=be(a,t),a.signingBonus=0,a.isFreeAgent=!1),e.push(a)}o.transferMarket.players=e.sort((i,a)=>a.overall-i.overall),o.transferMarket.lastRefresh=Date.now()}function nt(e,t=4){const n=Math.max(1,e-t),i=Math.min(99,e+t);return`${n}-${i}`}function Ri(e,t){const i=Math.max(t,e-6),a=Math.min(99,e+6);return`${i}-${a}`}function J(){const e=document.getElementById("transfer-list");if(!e)return;const t=document.querySelector(".transfer-filter.active")?.dataset.filter||"all",n=parseInt(document.getElementById("transfer-min-price")?.value)||0,i=parseInt(document.getElementById("transfer-max-price")?.value)||5e4,a=document.getElementById("transfer-free-only")?.checked||!1,s=document.getElementById("transfer-sort")?.value||"overall-desc";let r=[...o.transferMarket.players];t!=="all"&&(r=r.filter(u=>H(u.position)===t)),a?r=r.filter(u=>u.price===0):r=r.filter(u=>u.price>=n&&u.price<=i);const[l,c]=s.split("-");if(r.sort((u,f)=>{let m,p;switch(l){case"overall":m=u.overall,p=f.overall;break;case"potential":m=u.potential||u.overall,p=f.potential||f.overall;break;case"price":m=u.price,p=f.price;break;case"age":m=u.age,p=f.age;break;default:m=u.overall,p=f.overall}return c==="asc"?m-p:p-m}),r.length===0){e.innerHTML='<p class="no-results">Geen spelers gevonden met deze filters.</p>';return}let d="";r.forEach(u=>{const f=S[u.position]||{abbr:"??",color:"#666"};u.photo||ve(u.name,u.position);const m=u.position==="keeper",p=u.price===0?"Transfervrij":b(u.price),h=u.signingBonus>0?`+${b(u.signingBonus)}`:"",g=nt(u.overall,3),x=Ri(u.potential||u.overall,u.overall),k=m?[{key:"REF",label:"REF",value:u.attributes.REF||u.attributes.VER,color:"#f9a825"},{key:"BAL",label:"BAL",value:u.attributes.BAL||u.attributes.AAN,color:"#7cb342"},{key:"SNE",label:"SNE",value:u.attributes.SNE,color:"#ff9800"},{key:"FYS",label:"FYS",value:u.attributes.FYS,color:"#9c27b0"}]:[{key:"AAN",label:"AAN",value:u.attributes.AAN,color:"#9c27b0"},{key:"VER",label:"VER",value:u.attributes.VER,color:"#2196f3"},{key:"SNE",label:"SNE",value:u.attributes.SNE,color:"#ff9800"},{key:"FYS",label:"FYS",value:u.attributes.FYS,color:"#9c27b0"}],v=u.condition||85,$=u.energy||75;d+=`
            <div class="player-card transfer-card" data-player-id="${u.id}">
                <div class="pc-left">
                    <div class="pc-age-box">
                        <span class="pc-age-value">${u.age}</span>
                        <span class="pc-age-label">jr</span>
                    </div>
                    <span class="pc-flag-large">${u.nationality.flag}</span>
                </div>
                <div class="pc-info">
                    <div class="pc-name-row">
                        <span class="pc-name">${u.name}</span>
                        <span class="pc-pos" style="background: ${f.color}">${f.abbr}</span>
                    </div>
                    <div class="pc-finance transfer-finance">
                        <span class="pc-price ${u.price===0?"free":""}">${p}</span>
                        ${h?`<span class="pc-bonus">${h}</span>`:""}
                    </div>
                </div>
                <div class="pc-condition-bars">
                    <div class="pc-bar-item">
                        <div class="pc-bar-track">
                            <div class="pc-bar-fill" style="width: ${v}%; background: ${pe(v)}"></div>
                        </div>
                        <span class="pc-bar-label">Conditie</span>
                    </div>
                    <div class="pc-bar-item">
                        <div class="pc-bar-track">
                            <div class="pc-bar-fill" style="width: ${$}%; background: ${pe($)}"></div>
                        </div>
                        <span class="pc-bar-label">Energie</span>
                    </div>
                </div>
                <div class="pc-stats">
                    ${k.map(M=>`
                        <div class="pc-stat">
                            <div class="pc-stat-bar-bg">
                                <div class="pc-stat-bar" style="height: ${M.value}%; background: ${M.color}"></div>
                            </div>
                            <span class="pc-stat-val">${nt(M.value,5)}</span>
                            <span class="pc-stat-lbl">${M.label}</span>
                        </div>
                    `).join("")}
                </div>
                <div class="pc-ratings">
                    <div class="pc-overall" style="background: ${f.color}">
                        <span class="pc-overall-value">${g}</span>
                        <span class="pc-overall-label">ALG</span>
                    </div>
                    <div class="pc-potential" style="background: ${f.color}; opacity: 0.85;">
                        <span class="pc-potential-value">${x}</span>
                        <span class="pc-potential-label">POT</span>
                    </div>
                </div>
                <button class="btn btn-primary btn-sm btn-transfer-buy" data-player-id="${u.id}">
                    Kopen
                </button>
            </div>
        `}),e.innerHTML=d,document.querySelectorAll(".btn-transfer-buy").forEach(u=>{u.addEventListener("click",f=>{f.stopPropagation();const m=parseFloat(u.dataset.playerId);Ni(m)})})}function Ni(e){const t=o.transferMarket.players.find(a=>a.id===e);if(!t)return;const n=t.price+(t.signingBonus||0);if(n>o.club.budget){alert("Je hebt niet genoeg budget!");return}const i=t.price===0?`gratis (${b(t.signingBonus)} tekengeld)`:b(t.price);confirm(`Wil je ${t.name} contracteren voor ${i}?`)&&(o.club.budget-=n,o.players.push(t),o.transferMarket.players=o.transferMarket.players.filter(a=>a.id!==e),P(),J(),alert(`${t.name} is toegevoegd aan je selectie!`))}function Vi(){o.transferMarket.players.length===0&&tt(),document.querySelectorAll(".transfer-filter").forEach(a=>{a.addEventListener("click",()=>{document.querySelectorAll(".transfer-filter").forEach(s=>s.classList.remove("active")),a.classList.add("active"),J()})});const e=document.getElementById("transfer-min-price"),t=document.getElementById("transfer-max-price"),n=document.getElementById("transfer-free-only");e&&e.addEventListener("change",()=>{const a=parseInt(t?.value)||5e4;parseInt(e.value)>a&&(e.value=a),J()}),t&&t.addEventListener("change",()=>{const a=parseInt(e?.value)||0;parseInt(t.value)<a&&(t.value=a),J()}),n&&n.addEventListener("change",()=>{e&&(e.disabled=n.checked),t&&(t.disabled=n.checked),J()});const i=document.getElementById("transfer-sort");i&&i.addEventListener("change",J),document.getElementById("refresh-market-btn")?.addEventListener("click",()=>{tt(),J()})}function qi(){let e=100;const t=document.getElementById("scout-position")?.value||"all",n=parseInt(document.getElementById("scout-min-age")?.value)||16,i=parseInt(document.getElementById("scout-max-age")?.value)||35,a=parseInt(document.getElementById("scout-min-potential")?.value)||0,s=parseInt(document.getElementById("scout-min-aan")?.value)||0,r=parseInt(document.getElementById("scout-min-ver")?.value)||0,l=parseInt(document.getElementById("scout-min-tec")?.value)||0,c=parseInt(document.getElementById("scout-min-sne")?.value)||0,d=parseInt(document.getElementById("scout-min-fys")?.value)||0;t!=="all"&&(e-=10),n<20?e-=20:n<23?e-=10:n>=28&&(e+=5),n>=30&&(e+=5);const u=i-n;return u<5&&(e-=(5-u)*5),a>0&&(e-=Math.floor(a/10)*8),e-=Math.floor(s/10)*5,e-=Math.floor(r/10)*5,e-=Math.floor(l/10)*5,e-=Math.floor(c/10)*5,e-=Math.floor(d/10)*5,Math.max(5,Math.min(100,e))}function se(){const e=qi(),t=document.getElementById("success-meter-fill"),n=document.getElementById("success-percentage"),i=document.getElementById("success-hint");t&&(t.style.width=`${e}%`),n&&(n.textContent=`${e}%`),i&&(e>=80?(i.textContent="Hoge kans om een speler te vinden!",t.style.background="#4caf50"):e>=50?(i.textContent="Redelijke kans, kan even duren...",t.style.background="#ff9800"):(i.textContent="Lage kans - overweeg bredere criteria",t.style.background="#f44336"))}const ee={youngTalent:"Jonge talenten (onder 20) zijn extreem zeldzaam! Elke club jaagt op deze pareltjes. Het voordeel: als je ze vindt, ken ik hun exacte potentieel - geen gokwerk zoals op de transfermarkt.",youngPlayers:"Spelers van 20-23 zijn populair. Moeilijker te vinden, maar ik kan je precies vertellen wat hun plafond is. Op de transfermarkt zie je alleen schattingen!",experienced:"Ervaren spelers (28+) vind ik makkelijk. Minder potentieel, maar wel zekerheid. Hun stats zijn wat je krijgt - geen verrassingen.",highPotential:"Hoog potentieel als eis? Lastig! Maar als ik ze vind, weet je precies wat je koopt. De transfermarkt toont alleen vage ranges.",specific:"Specifieke eisen maken het zoeken lastiger. Maar elk speler die ik vind is grondig geanalyseerd - je ziet exacte waardes, niet geschatte ranges.",general:"Met scouting krijg je zekerheid! Op de transfermarkt zie je geschatte ranges (bijv. 45-52). Ik geef je de echte cijfers. Dat is mijn toegevoegde waarde."};function fe(){const e=document.getElementById("scout-advice");if(!e)return;const t=parseInt(document.getElementById("scout-min-age")?.value)||16,n=parseInt(document.getElementById("scout-min-potential")?.value)||0,i=document.getElementById("scout-position")?.value||"all";let a="";t<20?a=ee.youngTalent:t<23?a=ee.youngPlayers:t>=28?a=ee.experienced:n>60?a=ee.highPotential:i!=="all"?a=ee.specific:a=ee.general,e.innerHTML=`<p>${a}</p>`}function _i(){const e=document.getElementById("scout-min-age"),t=document.getElementById("scout-max-age"),n=document.getElementById("age-range-display"),i=document.getElementById("scout-age-hint"),a=()=>{const l=parseInt(e?.value)||16,c=parseInt(t?.value)||35;n&&(n.textContent=`${l} - ${c}`),i&&(l<20?(i.textContent="⚠️ Jonge talenten zijn moeilijk te vinden!",i.style.color="#f44336"):l<23?(i.textContent="Jonge spelers zijn lastiger te vinden",i.style.color="#ff9800"):l>=28?(i.textContent="✓ Ervaren spelers zijn makkelijker te vinden",i.style.color="#4caf50"):(i.textContent="Standaard leeftijdsrange",i.style.color="var(--text-muted)")),se(),fe()};e?.addEventListener("input",a),t?.addEventListener("input",a);const s=document.getElementById("scout-min-potential"),r=document.getElementById("potential-display");s?.addEventListener("input",()=>{r&&(r.textContent=s.value),se(),fe()}),document.getElementById("scout-position")?.addEventListener("change",()=>{se(),fe()}),["aan","ver","tec","sne","fys"].forEach(l=>{const c=document.getElementById(`scout-min-${l}`),d=document.getElementById(`scout-min-${l}-val`);c?.addEventListener("input",()=>{d&&(d.textContent=c.value),se()})}),a(),se(),fe()}function Oi(){document.getElementById("tactic-keeper-pressure")?.addEventListener("change",n=>{o.advancedTactics.keeperPressure=n.target.checked}),document.getElementById("tactic-set-pieces")?.addEventListener("change",n=>{o.advancedTactics.forceSetPieces=n.target.checked}),document.querySelectorAll(".choice-btn, .choice-btn-sm").forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.choice;(n.closest(".tactic-choice-group")||n.closest(".choice-btns")).querySelectorAll(".choice-btn, .choice-btn-sm").forEach(s=>s.classList.remove("active")),n.classList.add("active"),i.startsWith("fullback-")?o.advancedTactics.fullbackRuns=i.replace("fullback-",""):i.startsWith("marking-")&&(o.advancedTactics.marking=i.replace("marking-",""),zi())})});const e=document.getElementById("tactic-attack-defense"),t=document.getElementById("tactic-intensity");e?.addEventListener("input",n=>{o.advancedTactics.attackDefense=parseInt(n.target.value),Ce()}),t?.addEventListener("input",n=>{o.advancedTactics.duelIntensity=parseInt(n.target.value),Ce()}),Ce()}function zi(){const e=document.getElementById("marking-explanation");e&&(o.advancedTactics.marking==="zone"?e.innerHTML="<p>Zone: Spelers dekken gebieden. Beter tegen teams met veel balbezit.</p>":e.innerHTML="<p>Man: Spelers volgen tegenstanders. Beter tegen individuele kwaliteit.</p>")}function Ce(){const e=document.getElementById("attack-defense-value"),t=document.getElementById("intensity-value");if(e){const n=o.advancedTactics.attackDefense;n<25?e.textContent="Zeer Verdedigend":n<40?e.textContent="Verdedigend":n<60?e.textContent="Gebalanceerd":n<75?e.textContent="Aanvallend":e.textContent="Zeer Aanvallend"}if(t){const n=o.advancedTactics.duelIntensity;n<25?t.textContent="Voorzichtig":n<40?t.textContent="Rustig":n<60?t.textContent="Normaal":n<75?t.textContent="Intens":t.textContent="Agressief"}}function Hi(){const e=document.querySelectorAll(".tactics-tab"),t=document.querySelectorAll(".tactics-panel");e.forEach(n=>{n.addEventListener("click",()=>{const i=n.dataset.tab;e.forEach(a=>a.classList.remove("active")),n.classList.add("active"),t.forEach(a=>{a.classList.remove("active"),a.id===`${i}-panel`&&a.classList.add("active")}),i==="opstelling"&&(re(),le(),ce()),i==="specialisten"&&initSpecialists()})})}function Ye(){const e=document.getElementById("lineup-pitch"),t=document.getElementById("lineup-bench"),n=document.getElementById("lineup-formation-name");if(!e||!t)return;const i=o.formation,a=K[i];if(!a)return;n&&(n.textContent=i);let s=`
        <div class="lineup-field-bg">
            <div class="pitch-markings">
                <div class="center-circle"></div>
                <div class="center-line"></div>
                <div class="penalty-area top"></div>
                <div class="penalty-area bottom"></div>
                <div class="goal-area top"></div>
                <div class="goal-area bottom"></div>
            </div>
            <div class="lineup-positions">
    `;a.positions.forEach((u,f)=>{const m=o.lineup[f],p=S[u.role]||{abbr:"??",color:"#666"};s+=`
            <div class="lineup-slot"
                 data-index="${f}"
                 data-role="${u.role}"
                 style="left: ${u.x}%; top: ${u.y}%;"
                 onclick="openLineupDropdown(event, ${f}, '${u.role}')"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event)">
                ${m?`
                    <div class="lineup-player-filled" style="background: ${p.color}">
                        <span class="lp-overall">${m.overall}</span>
                        <span class="lp-name">${m.name.split(" ")[0]}</span>
                        <button class="lp-remove" onclick="event.stopPropagation(); removeFromLineup(${f})">×</button>
                    </div>
                `:`
                    <div class="lineup-slot-empty" style="border-color: ${p.color}">
                        <span>${p.abbr}</span>
                        <span class="slot-hint">Klik om te kiezen</span>
                    </div>
                `}
            </div>
        `}),s+="</div></div>",e.innerHTML=s;const r={attacker:{label:"AAN",players:[]},midfielder:{label:"MID",players:[]},defender:{label:"DEF",players:[]},goalkeeper:{label:"KEE",players:[]}},l=Object.values(o.lineup).filter(u=>u).map(u=>u.id);o.players.filter(u=>!l.includes(u.id)).forEach(u=>{const f=S[u.position];f&&r[f.group]&&r[f.group].players.push(u)});let d="";Object.entries(r).forEach(([u,f])=>{d+=`
            <div class="sidebar-group ${f.players.length===0?"empty":""}">
                <div class="sidebar-group-header">${f.label}</div>
                <div class="sidebar-players">
                    ${f.players.map(m=>{const p=S[m.position];return`
                            <div class="sidebar-player"
                                 draggable="true"
                                 data-player-id="${m.id}"
                                 ondragstart="handleDragStart(event)"
                                 ondragend="handleDragEnd(event)">
                                <span class="sp-overall" style="background: ${p?.color||"#666"}">${m.overall}</span>
                                <span class="sp-name">${m.name.split(" ")[0]}</span>
                            </div>
                        `}).join("")||'<span class="no-players">-</span>'}
                </div>
            </div>
        `}),t.innerHTML=d}let Ne=null;function Fi(e){Ne=e.target.dataset.playerId,e.target.classList.add("dragging"),e.dataTransfer.effectAllowed="move"}function Gi(e){e.preventDefault(),e.dataTransfer.dropEffect="move",(e.target.closest(".lineup-slot")||e.currentTarget).classList.add("drag-over")}function Ki(e){e.target.classList.remove("dragging"),document.querySelectorAll(".lineup-slot").forEach(t=>t.classList.remove("drag-over"))}function Yi(e){e.preventDefault();const t=e.target.closest(".lineup-slot")||e.currentTarget;t.classList.remove("drag-over");const n=parseInt(t.dataset.index),i=o.players.find(a=>a.id===parseFloat(Ne));i&&!isNaN(n)&&(Object.keys(o.lineup).forEach(a=>{o.lineup[a]?.id===i.id&&(o.lineup[a]=null)}),o.lineup[n]=i,Ye(),xe()),Ne=null}function Wi(e){o.lineup[e]=null,Ye(),xe()}function Ui(e,t,n){e.stopPropagation(),Ve();const i=e.currentTarget,a=S[n]||{abbr:"??",group:"midfielder"},s=Object.values(o.lineup).filter(f=>f).map(f=>f.id),r=o.players.filter(f=>!s.includes(f.id)),l=r.filter(f=>f.position===n),c=r.filter(f=>{const m=S[f.position];return m&&m.group===a.group&&f.position!==n});l.sort((f,m)=>m.overall-f.overall),c.sort((f,m)=>m.overall-f.overall);const d=document.createElement("div");d.className="lineup-dropdown",d.id="lineup-dropdown-active";let u=`<div class="dropdown-header">${a.abbr} - Kies speler</div>`;l.length>0&&(u+='<div class="dropdown-section-label">Beste keuze</div>',l.forEach(f=>{const m=S[f.position];u+=`
                <div class="dropdown-player" onclick="selectLineupPlayer(${t}, ${f.id})">
                    <span class="dp-overall" style="background: ${m?.color||"#666"}">${f.overall}</span>
                    <span class="dp-name">${f.name}</span>
                    <span class="dp-pos">${m?.abbr||"??"}</span>
                </div>
            `})),c.length>0&&(u+='<div class="dropdown-section-label">Alternatieven</div>',c.slice(0,5).forEach(f=>{const m=S[f.position];u+=`
                <div class="dropdown-player alt" onclick="selectLineupPlayer(${t}, ${f.id})">
                    <span class="dp-overall" style="background: ${m?.color||"#666"}">${f.overall}</span>
                    <span class="dp-name">${f.name}</span>
                    <span class="dp-pos">${m?.abbr||"??"}</span>
                </div>
            `})),l.length===0&&c.length===0&&(u+='<div class="dropdown-empty">Geen spelers beschikbaar</div>'),d.innerHTML=u,i.appendChild(d),setTimeout(()=>{document.addEventListener("click",Ve,{once:!0})},10)}function Ve(){const e=document.getElementById("lineup-dropdown-active");e&&e.remove()}function Ji(e,t){const n=o.players.find(i=>i.id===t);n&&(Object.keys(o.lineup).forEach(i=>{o.lineup[i]?.id===n.id&&(o.lineup[i]=null)}),o.lineup[e]=n,Ve(),Ye(),xe())}window.handleDragStart=Fi;window.handleDragOver=Gi;window.handleDragEnd=Ki;window.handleDrop=Yi;window.removeFromLineup=Wi;window.openLineupDropdown=Ui;window.selectLineupPlayer=Ji;function Zi(){document.documentElement.style.setProperty("--primary-green",o.club.colors.primary),document.documentElement.style.setProperty("--cream",o.club.colors.secondary),document.documentElement.style.setProperty("--orange",o.club.colors.accent);const e=document.getElementById("badge-path"),t=document.getElementById("badge-text-1"),n=document.getElementById("badge-text-2");e&&(e.setAttribute("fill",o.club.colors.primary),e.setAttribute("stroke",o.club.colors.secondary)),t&&t.setAttribute("fill",o.club.colors.secondary),n&&n.setAttribute("fill",o.club.colors.accent)}function Qi(){const e=document.getElementById("club-name-display");e&&(e.textContent=o.club.name)}function Tt(){const e=document.getElementById("team-name-input"),t=document.getElementById("team-primary-color"),n=document.getElementById("team-secondary-color"),i=document.getElementById("team-accent-color"),a=document.getElementById("save-team-btn"),s=document.getElementById("settings-notice"),r=document.getElementById("settings-locked");e&&(e.value=o.club.name),t&&(t.value=o.club.colors.primary),n&&(n.value=o.club.colors.secondary),i&&(i.value=o.club.colors.accent);const l=o.club.settingsChangedThisSeason;s&&(s.style.display=l?"none":"flex"),r&&(r.style.display=l?"flex":"none"),e&&(e.disabled=l),t&&(t.disabled=l),n&&(n.disabled=l),i&&(i.disabled=l),a&&(a.disabled=l),Ct(),At(),Xi(),Dt(),na(),ea(),ia()}function Ct(){const e=document.getElementById("badge-preview-svg");if(!e)return;const t=document.getElementById("team-primary-color")?.value||o.club.colors.primary,n=document.getElementById("team-secondary-color")?.value||o.club.colors.secondary,i=document.getElementById("team-accent-color")?.value||o.club.colors.accent;e.innerHTML=`
        <!-- Shield background -->
        <path d="M50 5 L95 25 L95 70 Q95 100 50 115 Q5 100 5 70 L5 25 Z" fill="${t}" stroke="${n}" stroke-width="3"/>

        <!-- Inner shield decoration -->
        <path d="M50 12 L88 28 L88 68 Q88 93 50 107 Q12 93 12 68 L12 28 Z" fill="none" stroke="${n}" stroke-width="1" opacity="0.3"/>

        <!-- Goal net symbol -->
        <g transform="translate(35, 25)">
            <!-- Goal posts -->
            <rect x="0" y="8" width="3" height="22" fill="${n}"/>
            <rect x="27" y="8" width="3" height="22" fill="${n}"/>
            <rect x="0" y="5" width="30" height="4" fill="${n}"/>
            <!-- Net lines -->
            <line x1="4" y1="9" x2="4" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="10" y1="9" x2="10" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="15" y1="9" x2="15" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="20" y1="9" x2="20" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="26" y1="9" x2="26" y2="30" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="3" y1="15" x2="27" y2="15" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <line x1="3" y1="22" x2="27" y2="22" stroke="${n}" stroke-width="0.5" opacity="0.6"/>
            <!-- Ball going in -->
            <circle cx="15" cy="20" r="6" fill="${i}" stroke="${n}" stroke-width="1"/>
            <path d="M12 17 L18 23 M18 17 L12 23" stroke="${n}" stroke-width="0.8" opacity="0.7"/>
        </g>

        <!-- FC text -->
        <text x="50" y="70" text-anchor="middle" fill="${n}" font-family="Bebas Neue, sans-serif" font-size="11" letter-spacing="2">FC</text>

        <!-- GOALS text -->
        <text x="50" y="85" text-anchor="middle" fill="${i}" font-family="Bebas Neue, sans-serif" font-size="16" font-weight="bold" letter-spacing="1">GOALS</text>

        <!-- MAKEN text -->
        <text x="50" y="100" text-anchor="middle" fill="${n}" font-family="Bebas Neue, sans-serif" font-size="12" letter-spacing="2">MAKEN</text>
    `}function At(){const e=document.querySelector(".kit-svg");if(!e)return;const t=document.getElementById("team-primary-color")?.value||o.club.colors.primary,n=document.getElementById("team-secondary-color")?.value||o.club.colors.secondary,i=document.getElementById("team-accent-color")?.value||o.club.colors.accent;e.style.setProperty("--kit-primary",t),e.style.setProperty("--kit-secondary",n),e.style.setProperty("--kit-accent",i)}function Xi(){const e=["Eredivisie","Eerste Divisie","Tweede Divisie","1e Klasse","2e Klasse","3e Klasse","4e Klasse","5e Klasse","6e Klasse"];document.getElementById("club-founded").textContent=`Seizoen ${o.club.stats?.founded||1}`,document.getElementById("club-titles").textContent=o.club.stats?.titles||0,document.getElementById("club-highest-div").textContent=e[o.club.stats?.highestDivision||8]||"6e Klasse",document.getElementById("club-total-goals").textContent=o.club.stats?.totalGoals||0,document.getElementById("club-total-matches").textContent=o.club.stats?.totalMatches||0,document.getElementById("club-reputation").textContent=o.club.reputation||10}function ea(){const e=document.getElementById("team-primary-color"),t=document.getElementById("team-secondary-color"),n=document.getElementById("team-accent-color"),i=document.getElementById("save-team-btn");[e,t,n].forEach(a=>{a&&(a.removeEventListener("input",it),a.addEventListener("input",it))}),i&&(i.removeEventListener("click",at),i.addEventListener("click",at))}function it(){Ct(),At()}function at(){if(o.club.settingsChangedThisSeason){alert("Je hebt je club dit seizoen al aangepast. Wacht tot volgend seizoen.");return}const e=document.getElementById("team-name-input"),t=document.getElementById("team-primary-color"),n=document.getElementById("team-secondary-color"),i=document.getElementById("team-accent-color");if(!e?.value.trim()){alert("Voer een geldige clubnaam in.");return}o.club.name=e.value.trim(),o.club.colors.primary=t?.value||o.club.colors.primary,o.club.colors.secondary=n?.value||o.club.colors.secondary,o.club.colors.accent=i?.value||o.club.colors.accent,o.club.settingsChangedThisSeason=!0,Zi(),Qi(),ta(),Tt(),alert("Club instellingen opgeslagen! Dit kan pas volgend seizoen weer gewijzigd worden.")}function ta(){const e=document.getElementById("club-badge-svg");if(!e)return;const{primary:t,secondary:n,accent:i}=o.club.colors,a=e.querySelector("#badge-path"),s=e.querySelector("#badge-text-fc"),r=e.querySelector("#badge-text-1"),l=e.querySelector("#badge-text-2");a&&(a.setAttribute("fill",t),a.setAttribute("stroke",n)),s&&s.setAttribute("fill",n),r&&r.setAttribute("fill",i),l&&l.setAttribute("fill",n),e.querySelectorAll('[fill="var(--text-primary)"]').forEach(c=>{c.setAttribute("fill",n)}),e.querySelectorAll('[stroke="var(--text-primary)"]').forEach(c=>{c.setAttribute("stroke",n)})}function na(){const e=document.getElementById("achievements-progress"),t=document.getElementById("achievements-grid");if(!e||!t)return;const n=Pe(o),i=pt(o);e.innerHTML=`
        <span class="progress-text">${n.unlocked} / ${n.total} behaald</span>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${n.progress}%"></div>
        </div>
    `;let a="";i.forEach(s=>{const r=s.hidden&&!s.unlocked,l=r?"Verborgen":s.name,c=r?"???":s.description;a+=`
            <div class="achievement-item ${s.unlocked?"unlocked":""} ${s.hidden?"hidden-achievement":""}">
                <div class="achievement-icon">${r?"❓":s.icon}</div>
                <div class="achievement-info">
                    <span class="achievement-name">${l}</span>
                    <span class="achievement-desc">${c}</span>
                </div>
                ${s.unlocked?'<span class="achievement-check">✓</span>':""}
            </div>
        `}),t.innerHTML=a}function ia(){const e=document.getElementById("toggle-achievements"),t=document.getElementById("achievements-grid");!e||!t||e.addEventListener("click",()=>{const n=t.style.display==="none";t.style.display=n?"grid":"none",e.textContent=n?"Verberg":"Toon Alle"})}let ge="12-13";function aa(){o.youthPlayers.length===0&&sa(),It(),We(ge),la()}function sa(){[{min:12,max:13,count:y(3,5)},{min:14,max:15,count:y(3,5)},{min:16,max:17,count:y(2,4)}].forEach(t=>{for(let n=0;n<t.count;n++){const i=oa(t.min,t.max);o.youthPlayers.push(i)}})}function oa(e,t){const n=y(e,t),i=te[Math.random()<.7?0:y(0,te.length-1)],a=Ae[y(0,Ae.length-1)],s=Ie[y(0,Ie.length-1)],r=Object.keys(S).filter(v=>!(n<14&&v==="keeper")),l=r[y(0,r.length-1)],c=15,d=40,u=y(50,85),f=Math.random()<.15?y(10,20):0,m=Math.min(99,u+f),p=.3+(n-12)*.08,h={AAN:Math.round(y(c,d)*p),VER:Math.round(y(c,d)*p),SNE:Math.round(y(c,d)*p),FYS:Math.round(y(c,d)*p)};l==="keeper"&&(h.REF=Math.round(y(c,d)*p),h.BAL=Math.round(y(c,d)*p));const g=S[l].weights;let x=0;Object.keys(g).forEach(v=>{x+=(h[v]||0)*g[v]}),x=Math.round(x);const k=m>=75;return{id:Date.now()+Math.random(),name:`${a} ${s}`,age:n,nationality:i,position:l,attributes:h,overall:x,potential:m,isSupertalent:k,growthRate:y(2,5),yearsInAcademy:y(1,3)}}function It(){const e=o.youthPlayers.length,t=o.youthPlayers.filter(n=>n.isSupertalent).length;document.getElementById("youth-count").textContent=e,document.getElementById("youth-talents").textContent=t}function We(e){const t=document.getElementById("youth-players-grid"),n=document.getElementById("youth-empty-state");if(!t)return;const[i,a]=e.split("-").map(Number),s=o.youthPlayers.filter(r=>r.age>=i&&r.age<=a);if(s.length===0){t.innerHTML="",n&&(n.style.display="block");return}n&&(n.style.display="none"),s.sort((r,l)=>l.potential-r.potential),t.innerHTML=s.map(r=>ra(r)).join(""),t.querySelectorAll(".btn-sign-contract").forEach(r=>{r.addEventListener("click",()=>{const l=parseFloat(r.dataset.playerId);ca(l)})})}function ra(e){const t=S[e.position]||{abbr:"??",color:"#666"},n=e.age>=16,i=e.potential;return`
        <div class="player-card youth-card ${e.isSupertalent?"supertalent":""}" data-player-id="${e.id}">
            <div class="pc-left">
                <div class="pc-age-box">
                    <span class="pc-age-value">${e.age}</span>
                    <span class="pc-age-label">jr</span>
                </div>
                <span class="pc-flag-large">${e.nationality.flag}</span>
            </div>
            <div class="pc-info">
                <div class="pc-name-row">
                    <span class="pc-name">${e.name}</span>
                    <span class="pc-pos" style="background: ${t.color}">${t.abbr}</span>
                    ${e.isSupertalent?'<span class="pc-talent">⭐</span>':""}
                </div>
                <div class="pc-finance">
                    <span class="pc-growth">Groei: +${e.growthRate}/sz</span>
                </div>
            </div>
            <div class="pc-ratings">
                <div class="pc-overall" style="background: ${t.color}">
                    <span class="pc-overall-value">${e.overall||"?"}</span>
                    <span class="pc-overall-label">ALG</span>
                </div>
                <div class="pc-potential" style="background: ${t.color}; opacity: 0.85;">
                    <span class="pc-potential-value">${i}</span>
                    <span class="pc-potential-label">POT</span>
                </div>
            </div>
            <div class="pc-action">
                <button class="btn ${n?"btn-primary":"btn-secondary"} btn-sign-contract btn-sm"
                        data-player-id="${e.id}"
                        ${n?"":"disabled"}>
                    ${n?"✍️ Contract":"🔒 16+"}
                </button>
            </div>
        </div>
    `}function la(){document.querySelectorAll(".youth-tab").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll(".youth-tab").forEach(t=>t.classList.remove("active")),e.classList.add("active"),ge=e.dataset.age,We(ge)})})}function ca(e){const t=o.youthPlayers.findIndex(h=>h.id===e);if(t===-1)return;const n=o.youthPlayers[t];if(n.age<16){alert("Spelers moeten minimaal 16 jaar oud zijn om een profcontract te tekenen.");return}const i=o.club.division,a=ne(i),s=a?a.salary.avg:50,r=(n.potential-50)*2,l=Math.max(a?.salary.min||25,Math.round(s*.5+r)),c=[...Q.good,...Q.neutral,...Q.bad],d=c[y(0,c.length-1)],u=Object.entries(n.attributes).filter(([h])=>h!=="REF"&&h!=="BAL").sort((h,g)=>g[1]-h[1])[0],m=ot[n.position]?.[u?.[0]]?.name||"Jeugdproduct",p={id:Date.now()+Math.random(),name:n.name,age:n.age,nationality:n.nationality,position:n.position,attributes:{...n.attributes},overall:n.overall,potential:n.potential,salary:l,personality:d,tag:m,condition:100,energy:100,form:70,morale:80,injuryDaysLeft:0,contractYears:3,isYouthProduct:!0};o.players.push(p),o.youthPlayers.splice(t,1),It(),We(ge),alert(`${n.name} heeft een profcontract getekend en is toegevoegd aan de A-selectie!`)}function da(){const t=o.sponsor?.weeklyPay||0,n=Math.round(t/7),i=Y.sponsoring.find(k=>k.id===o.stadium.sponsoring)?.dailyIncome||0,a=o.stadium.fanshop.reduce((k,v)=>{const $=Y.fanshop.find(M=>M.id===v);return k+($?.dailyIncome||0)},0),r=W?.kantine?.levels.find(k=>k.id===o.stadium.kantine)?.effect?.match(/€(\d+)/),l=r?parseInt(r[1]):50,c=Math.round(l/7),d=o.players.reduce((k,v)=>k+(v.salary||0),0),u=Math.round(d/7);let f=0;o.staff?.fysio&&(f+=100),o.staff?.scout&&(f+=150),o.staff?.dokter&&(f+=200),Object.values(o.assistantTrainers||{}).forEach(k=>{k&&(f+=75)});const m=Math.round(f/7),p=Math.round((Y.tribunes.find(k=>k.id===o.stadium.tribune)?.maintenance||0)/7),h=n+i+a+c,g=u+m+p,x=h-g;return{income:{sponsor:n,sponsoringBonus:i,merch:a,kantine:c},expense:{playerSalary:u,staffSalary:m,maintenance:p},totalIncome:h,totalExpense:g,dailyBalance:x,tomorrowBalance:o.club.budget+x,weeklyPlayerSalary:d,weeklyStaffSalary:f,weeklySponsor:t}}function ua(){const e=da(),t=document.getElementById("current-balance");t&&(t.textContent=b(o.club.budget));const n=document.getElementById("tomorrow-balance");n&&(n.textContent=b(e.tomorrowBalance));const i=document.getElementById("total-income");i&&(i.textContent=`+${b(e.totalIncome)}`);const a=document.getElementById("income-breakdown");a&&(a.innerHTML=`
            <li><span>Shirtsponsor</span><span>+${b(e.income.sponsor)}</span></li>
            <li><span>Sponsoring Niveau</span><span>+${b(e.income.sponsoringBonus)}</span></li>
            <li><span>Merchandise</span><span>+${b(e.income.merch)}</span></li>
            <li><span>Kantine</span><span>+${b(e.income.kantine)}</span></li>
        `);const s=document.getElementById("total-expense");s&&(s.textContent=`-${b(e.totalExpense)}`);const r=document.getElementById("expense-breakdown");r&&(r.innerHTML=`
            <li><span>Spelerssalarissen</span><span>-${b(e.expense.playerSalary)}</span></li>
            <li><span>Stafsalarissen</span><span>-${b(e.expense.staffSalary)}</span></li>
            <li><span>Onderhoud</span><span>-${b(e.expense.maintenance)}</span></li>
        `);const l=document.getElementById("total-profit");if(l){const T=e.dailyBalance>=0?"profit":"loss";l.textContent=(e.dailyBalance>=0?"+":"")+b(e.dailyBalance),l.className=`finance-total ${T}`}const c=document.getElementById("daily-profit"),d=document.getElementById("weekly-profit"),u=document.getElementById("monthly-profit");if(c&&(c.textContent=(e.dailyBalance>=0?"+":"")+b(e.dailyBalance),c.className=`period-value ${e.dailyBalance>=0?"positive":"negative"}`),d){const T=e.dailyBalance*7;d.textContent=(T>=0?"+":"")+b(T),d.className=`period-value ${T>=0?"positive":"negative"}`}if(u){const T=e.dailyBalance*30;u.textContent=(T>=0?"+":"")+b(T),u.className=`period-value ${T>=0?"positive":"negative"}`}const f=document.getElementById("current-balance-bottom");f&&(f.textContent=b(o.club.budget));const m=document.getElementById("balance-change");if(m){const T=(e.dailyBalance>=0?"+":"")+b(e.dailyBalance)+" vandaag";m.textContent=T,m.className=`balance-change ${e.dailyBalance>=0?"positive":"negative"}`}const p=34-o.week,h=e.dailyBalance*7,g=e.totalIncome*7*p,x=e.totalExpense*7*p,k=o.club.budget+h*p,v=document.getElementById("season-end-estimate");v&&(v.textContent=b(Math.round(k)));const $=document.getElementById("season-income");$&&($.textContent="+"+b(Math.round(g)));const M=document.getElementById("season-expense");M&&(M.textContent="-"+b(Math.round(x)));const A=document.querySelector(".prediction-subtitle");A&&(A.textContent=`Over ${p} weken`)}const R={lineup:["Heb je de opstelling al bekeken? Zorg dat iedereen op z'n plek staat!","Een goede opstelling is het halve werk, zeggen ze altijd.","Sommige jongens presteren beter op bepaalde posities. Experimenteer gerust!","Die linksback van ons kan ook prima op het middenveld uit de voeten.","Vergeet niet: een sterk middenveld wint wedstrijden!"],training:["Jonge spelers hebben potentieel. Laat ze regelmatig trainen!","Training is de sleutel tot groei. Vergeet de talenten niet!","Een getraind team is een winnend team, dat zei mijn vader ook altijd.","Die jonge gasten moeten meer trainen, anders worden ze niks.","Conditietraining is niet sexy, maar wel belangrijk!"],scout:["Op zoek naar nieuw talent? De scout kan helpen!","Scouten op jonge spelers is lastig, maar de beloning kan groot zijn.","Ervaren spelers zijn makkelijker te vinden dan jong talent.","Ik hoorde dat er een talentje rondloopt bij de buren...","Een goede scout is goud waard voor een club als de onze."],stadium:["Upgrade het stadion voor meer inkomsten en thuisvoordeel!","Een groter stadion betekent meer fans en meer geld.","De faciliteiten niet vergeten - horeca levert extra inkomsten op.","Die kleedkamers kunnen wel een likje verf gebruiken.","Met beter veldonderhoud spelen we ook beter voetbal!"],kantine:["Na de wedstrijd is de derde helft net zo belangrijk, hè?","De kantine draait goed dit seizoen. Mooi voor de clubkas!","Vergeet niet even langs de bar te komen na afloop.","Een goed gesprek in de kantine lost veel problemen op.","De bitterballen zijn vers, zegt de kantinebeheerder.","Zonder vrijwilligers in de kantine zijn we nergens.","Het clubgevoel ontstaat in de kantine, niet op het veld.","Zaterdag is er stamppot in de kantine. Niet te missen!"],weer:["Het wordt wisselvallig dit weekend. Misschien moddervoetbal!","Bij dit weer moet je korte passes spelen, lange ballen werken niet.","Hopelijk blijft het droog, anders wordt het een modderbad.","Met deze wind moet je slim spelen. Gebruik hem in je voordeel!","Het veld ligt er goed bij ondanks het weer van vorige week."],scheids:["Respect voor de scheidsrechter, ook als hij fout zit!","Die scheids van vorige week... ach, laat ik maar niks zeggen.","Zonder scheidsrechters geen wedstrijden. Behandel ze netjes!","Ik hoop dat we dit keer een ervaren scheids krijgen.","Discussiëren met de scheids heeft nog nooit geholpen."],motivatie:["Ik geloof in dit team. Jullie kunnen het!","Elke wedstrijd is een nieuwe kans om te laten zien wat we kunnen.","Verlies hoort erbij, maar opgeven nooit!","Discipline en inzet, daar win je mee.","Samen staan we sterk. Dat is de kracht van deze club!","Laat je niet gek maken door de tegenstander.","Focus op jezelf, niet op de ander.","Dit seizoen gaan we het doen, ik voel het!"],financien:["De begroting is krap, maar we redden het wel weer.","Elke euro telt bij een club als de onze.","De sponsors zijn tevreden, dat is goed nieuws!","Misschien moeten we een loterij organiseren voor extra geld.","De contributie komt binnen, dus we draaien quitte.","Investeer slim, want het geld groeit niet aan de bomen."],jeugd:["De jeugd is de toekomst van deze club!","Ik zag een paar talenten bij de F-jes. Veelbelovend!","Laat de jeugd meekijken bij het eerste. Dat motiveert!","Een sterke jeugdopleiding is de basis van succes.","Die jongen uit de A1 kan zo door naar het eerste, let op mijn woorden."],blessures:["Hopelijk blijven we dit seizoen van blessures gespaard.","Goed warmlopen voorkomt veel ellende!","Die hamstringblessures komen vaak door te weinig rekken.","Luister naar je lichaam, forceer niks.","De fysio is z'n gewicht in goud waard voor ons."],wedstrijd:["Vandaag moeten we vanaf de eerste minuut scherp zijn!","Onderschat de tegenstander niet, dat is al vaker fout gegaan.","Een goede voorbereiding is het halve werk.","Concentratie en discipline, daar gaan we het mee winnen.","De tegenstander heeft ook zwakke punten. Benut ze!"],club:["Deze club is meer dan voetbal. Het is familie!","Al generaties lang komen mensen hier samen voor de liefde van het spel.","De clubkleuren dragen is een eer, vergeet dat nooit.","Wat er ook gebeurt, we blijven trots op onze club.","De sfeer hier is uniek. Dat vind je nergens anders!"],humor:["Weet je wat het verschil is tussen voetbal en politiek? Bij voetbal mag je nog eerlijk zijn!","Onze keeper vangt alles... behalve de bus van half negen.","Die spits van ons schiet vaker naast dan raak, maar hij is wel gezellig!","Ik zei tegen de trainer: meer balbezit! Nu houden ze de bal vast in de kantine.","Vroeger was alles beter, behalve ons voetbal. Dat was altijd al matig.","Een goede verdediger is als een goede schoonmoeder: altijd in de weg!"],general:["Welkom! Als voorzitter help ik je met tips.","Elke beslissing telt. Bouw de club stap voor stap op!","Succes komt niet vanzelf - train, scout en investeer!","Ik sta altijd klaar voor de club. Dag en nacht!","Samen maken we er een mooi seizoen van.","Vertrouw op het proces. Rome is ook niet in één dag gebouwd.","Communicatie is alles in een team. Praat met elkaar!","Een club bouwen kost tijd, maar het is het waard."]};function fa(){const e=[];return Math.random()<.3&&e.push(...R.lineup),(o.players?.filter(i=>i.age<=23)||[]).length>0&&Math.random()<.3&&e.push(...R.training),Math.random()<.25&&e.push(...R.scout),Math.random()<.25&&e.push(...R.stadium),Math.random()<.4&&e.push(...R.kantine),Math.random()<.2&&e.push(...R.weer),Math.random()<.15&&e.push(...R.scheids),Math.random()<.35&&e.push(...R.motivatie),Math.random()<.2&&e.push(...R.financien),Math.random()<.25&&e.push(...R.jeugd),Math.random()<.15&&e.push(...R.blessures),Math.random()<.3&&e.push(...R.wedstrijd),Math.random()<.25&&e.push(...R.club),Math.random()<.2&&e.push(...R.humor),e.push(...R.general),e[Math.floor(Math.random()*e.length)]}function st(){const e=document.getElementById("chairman-tip"),t=document.getElementById("chairman-avatar");if(!e||!t)return;t.classList.add("talking");const n=fa();e.style.opacity="0",setTimeout(()=>{e.textContent=n,e.style.opacity="1",setTimeout(()=>{t.classList.remove("talking")},1500)},300)}function ma(){st(),setInterval(st,15e3)}function pa(){const e=Ut();if(e){lt(e),console.log("📂 Save file loaded!");const i=Qt(o);i&&i.hoursAway>=1&&(Xt(o,i),Pa(i))}else o.players=Bn(o.club.division),o.standings=dt(o.club.name,o.club.division),o.achievements=mt();const t=ft(o);t.claimed&&setTimeout(()=>{Ba(t)},1e3),Fe(),Ge(),X(),P(),ke(),Ai(),Bi(),Li(),Di(),oi(),Pi(),Vi(),_i(),Oi(),Hi(),ma(),Ea(),Fa(),ji(),Zt(o),ht(o)&&setTimeout(_a,5e3);const n=ze(o);n.length>0&&setTimeout(()=>{n.forEach((i,a)=>{setTimeout(()=>{Ue(i)},a*1500)})},2e3),console.log("🎮 Zaterdagvoetbal v2.0 initialized!"),console.log("📊 Squad:",o.players.length,"players"),console.log("💰 Budget:",b(o.club.budget)),console.log("🏆 Achievements:",Pe(o).unlocked+"/"+Pe(o).total)}function ke(){const e=De(o.manager?.xp||0),t=e.xp,n=t+e.xpToNext,i=Math.round(e.progress*100),a=document.getElementById("trainer-title"),s=document.getElementById("trainer-level"),r=document.getElementById("xp-current"),l=document.getElementById("xp-target"),c=document.getElementById("xp-fill");a&&(a.textContent=e.title),s&&(s.textContent=e.level),r&&(r.textContent=t),l&&(l.textContent=e.xpToNext>0?n:"MAX"),c&&(c.style.width=`${i}%`);const d=document.getElementById("global-manager-title"),u=document.getElementById("global-manager-level");d&&(d.textContent=e.title),u&&(u.textContent=e.level);const f=o.dailyRewards?.streak||0,m=document.getElementById("daily-streak");m&&m.classList.contains("daily-streak-sticker")&&(m.innerHTML=`
            <span class="streak-fire">🔥</span>
            <span class="streak-count">${f}</span>
            <span class="streak-label">dagen</span>
        `);const p=document.getElementById("streak-days");p&&(p.textContent=f);const h=document.querySelector(".streak-display");h&&(h.textContent=f);const g=document.getElementById("btn-claim-daily");if(g){const z=new Date().toDateString(),_=o.dailyRewards?.lastClaimDate===z,de=f%7+1,G=[100,200,300,400,500,600,1e3];_?(g.disabled=!0,g.textContent="✓"):(g.disabled=!1,g.textContent=`€${G[de-1]}`)}const x=document.getElementById("season-number"),k=document.getElementById("week-number"),v=document.getElementById("newspaper-week"),$=document.getElementById("poster-matchday");x&&(x.textContent=o.season),k&&(k.textContent=o.week),v&&(v.textContent=o.week),$&&($.textContent=o.week);const M=document.getElementById("home-team-name"),A=document.getElementById("away-team-name");M&&(M.textContent=o.club.name),A&&o.nextMatch&&(A.textContent=o.nextMatch.opponent);const T=document.getElementById("stat-wins"),j=document.getElementById("stat-draws"),N=document.getElementById("stat-losses");T&&(T.textContent=o.stats?.wins||0),j&&(j.textContent=o.stats?.draws||0),N&&(N.textContent=o.stats?.losses||0),wa(),ha(),ga(),ba(),ka()}function ha(){const e=document.getElementById("dashboard-starplayers");if(!e)return;const t=o.players.sort((n,i)=>i.overall-n.overall).slice(0,3);if(t.length===0){e.innerHTML='<p style="font-size: 0.65rem; color: var(--text-muted); text-align: center; padding: 8px;">Geen spelers</p>';return}e.innerHTML=t.map(n=>{const i=S[n.position]||{color:"#1a5f2a",abbr:"?"};return`
            <div class="sp-item">
                <span class="sp-flag">${n.nationality?.flag||"🇳🇱"}</span>
                <div class="sp-info">
                    <span class="sp-name">${n.name}</span>
                    <span class="sp-age">${n.age} jaar</span>
                </div>
                <span class="sp-pos" style="background: ${i.color}">${i.abbr}</span>
                <span class="sp-overall" style="color: ${i.color}">${n.overall}</span>
            </div>
        `}).join("")}function ga(){const e=document.getElementById("dashboard-toptalents");if(!e)return;const t=(o.youthPlayers||[]).sort((n,i)=>(i.potential||0)-(n.potential||0)).slice(0,3);if(t.length===0){e.innerHTML='<p style="font-size: 0.6rem; color: var(--text-muted); text-align: center; padding: 6px;">Upgrade jeugdacademie</p>';return}e.innerHTML=t.map(n=>{const i=n.potential||50,a=Math.round(i/20*2)/2,s=Math.floor(a),r=a%1!==0;let l="";for(let d=0;d<s;d++)l+="★";r&&(l+="½");for(let d=0;d<5-s-(r?1:0);d++)l+="☆";const c=S[n.position]||{color:"#1a5f2a",abbr:"?"};return`
            <div class="tt-item">
                <span class="tt-flag">${n.nationality?.flag||"🇳🇱"}</span>
                <div class="tt-info">
                    <span class="tt-name">${n.name}</span>
                    <span class="tt-age">${n.age} jaar</span>
                </div>
                <span class="tt-pos" style="background: ${c.color}">${c.abbr}</span>
                <span class="tt-stars">${l}</span>
            </div>
        `}).join("")}function ya(){const e=[],t=o.players?.filter(d=>{const u=d.lastTraining||0,f=1440*60*1e3;return Date.now()-u>f})||[];t.length>0&&e.push({type:"training",title:"Training beschikbaar",desc:`${t.length} speler${t.length>1?"s":""} ${t.length>1?"kunnen":"kan"} trainen`,icon:"training",action:"training",priority:2});const n=o.players?.filter(d=>d.injured&&d.injuryWeeks>0)||[];if(n.length>0){const d=n[0];e.push({type:"injury",title:"Speler geblesseerd",desc:`${d.name} (nog ${d.injuryWeeks} ${d.injuryWeeks===1?"week":"weken"})`,icon:"injury",action:"squad",priority:3})}if(o.nextMatch){const d=o.nextMatch.time;Date.now()>=d&&e.push({type:"match",title:"Wedstrijd speelbaar!",desc:`Tegen ${o.nextMatch.opponent}`,icon:"match",action:"dashboard",priority:5})}o.scoutResult&&!o.scoutResult.viewed&&e.push({type:"scout",title:"Talent gevonden!",desc:"Je scout heeft een speler gevonden",icon:"scout",action:"scout",priority:4});const i=o.club?.budget||0,a=o.players?.reduce((d,u)=>d+(u.wage||0),0)||0;i<a*4&&i>0&&e.push({type:"finance",title:"Lage clubkas",desc:`Nog ${Math.floor(i/a)} weken budget`,icon:"finance",action:"finances",priority:2});const s=(o.youthPlayers||[]).filter(d=>d.age>=17&&(d.potential||0)>=60);s.length>0&&e.push({type:"youth",title:"Talent klaar",desc:`${s[0].name} kan doorstromen`,icon:"youth",action:"youth",priority:2});const r=o.standings?.find(d=>d.isPlayer),l=r?o.standings.indexOf(r)+1:0;l<=2&&o.week>5?e.push({type:"sponsor",title:"Promotiekoers!",desc:`Je staat ${l}e in de competitie`,icon:"trophy",action:"dashboard",priority:1}):l>=7&&o.week>5&&e.push({type:"injury",title:"Degradatiegevaar",desc:`Je staat ${l}e in de competitie`,icon:"warning",action:"dashboard",priority:3});const c=o.players?.filter(d=>d.contractYears===1)||[];return c.length>0&&e.push({type:"contract",title:"Contract loopt af",desc:`${c[0].name} - nog 1 jaar`,icon:"contract",action:"squad",priority:1}),Math.random()<.3&&!o.pendingSponsor&&(o.pendingSponsor=!0,e.push({type:"sponsor",title:"Sponsor interesse",desc:"Een lokale ondernemer wil sponsoren",icon:"sponsor",action:"sponsors",priority:2})),e.sort((d,u)=>u.priority-d.priority),e.slice(0,6)}function va(e){const t={training:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 6.5h11v11h-11z"/><path d="M6.5 1v5.5M17.5 1v5.5M1 6.5h5.5M17.5 6.5H23M6.5 17.5v5.5M17.5 17.5v5.5M1 17.5h5.5M17.5 17.5H23"/></svg>',injury:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>',match:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20M2 12h20"/></svg>',scout:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',finance:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',youth:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 22V10M14 22V10M8 6h8l-1 8H9L8 6z"/></svg>',warning:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>',contract:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',sponsor:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3v4M8 3v4M2 11h20"/></svg>'};return t[e]||t.match}function ba(){const e=document.getElementById("dashboard-notifications");if(!e)return;const t=ya();if(t.length===0){e.innerHTML=`
            <div class="notifications-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                    <path d="M22 4L12 14.01l-3-3"/>
                </svg>
                <span>Alles onder controle!</span>
            </div>
        `;return}e.innerHTML=t.map(n=>`
        <div class="notification-item type-${n.type}" onclick="handleNotificationClick('${n.action}')">
            <div class="notification-icon">
                ${va(n.icon)}
            </div>
            <div class="notification-content">
                <div class="notification-title">${n.title}</div>
                <div class="notification-desc">${n.desc}</div>
            </div>
            <span class="notification-arrow">→</span>
        </div>
    `).join("")}function xa(e){const n={training:"training",squad:"squad",scout:"scout",finances:"finances",sponsors:"sponsors",youth:"youth",dashboard:"dashboard",tactics:"tactics"}[e]||"dashboard";navigateTo(n)}window.handleNotificationClick=xa;function wa(){const e=document.getElementById("top-scorer-photo"),t=document.getElementById("top-scorer-name"),n=document.getElementById("top-scorer-stat");if(!e||!t||!n)return;const i=o.players.filter(a=>a.goals>0).sort((a,s)=>s.goals-a.goals)[0];i?(e.textContent="⚽",t.textContent=i.name,n.textContent=`${i.goals} doelpunten`):(e.textContent="⭐",t.textContent="Nog geen",n.textContent="topscorer")}function ka(){document.querySelectorAll(".sticky-note, .sticky-compact, .kd-action, .da-btn").forEach(t=>{const n=t.cloneNode(!0);t.parentNode.replaceChild(n,t),n.addEventListener("click",()=>{switch(n.dataset.action){case"training":document.querySelector('[data-page="training"]')?.click();break;case"lineup":document.querySelector('[data-page="tactics"]')?.click();break;case"scout":document.querySelector('[data-page="scout"]')?.click();break;case"transfers":document.querySelector('[data-page="transfers"]')?.click();break;case"squad":document.querySelector('[data-page="squad"]')?.click();break;case"stadium":document.querySelector('[data-page="stadium"]')?.click();break}})})}function Sa(){const e=ft(o);if(e.alreadyClaimed){E("Je hebt vandaag al geclaimd!","info");return}e.claimed&&(E(`+€${e.reward.amount} ontvangen! ${e.reward.description}`,"success"),P(),ke(),F())}window.claimDailyBonus=Sa;function Ea(){const e=document.getElementById("play-match-btn");e&&e.addEventListener("click",Ma)}function Ma(){const e=Date.now();if(o.nextMatch.time>e){E("De wedstrijd is nog niet beschikbaar!","warning");return}if(o.lineup.filter(d=>d!==null).length<11){E("Vul eerst je opstelling aan (11 spelers nodig)!","error");return}const n=an(o.club.division,o.nextMatch.opponentPosition||y(1,8));n.name=o.nextMatch.opponent||n.name;const i=o.week%2===1,a=rn({name:o.club.name,strength:Le(o.lineup,o.formation,o.tactics,o.lineup)},n,o.lineup,o.formation,o.tactics,i),s=i?a.homeScore:a.awayScore,r=i?a.awayScore:a.homeScore;cn(o.lineup,a,i),me(o.standings,o.club.name,s,r),me(o.standings,n.name,r,s),fn(o.standings),o.club.stats.totalMatches++,o.club.stats.totalGoals+=s;const l=ct(a.homeScore,a.awayScore,i);if(l==="win"?(o.stats.wins++,o.stats.currentUnbeaten++,o.stats.currentWinStreak=(o.stats.currentWinStreak||0)+1,i&&o.stats.homeWins++):l==="draw"?(o.stats.draws++,o.stats.currentUnbeaten++,o.stats.currentWinStreak=0):(o.stats.losses++,o.stats.currentUnbeaten=0,o.stats.currentWinStreak=0),r===0&&o.stats.cleanSheets++,s>o.stats.highestScoreMatch&&(o.stats.highestScoreMatch=s),new Date().getDay()===6&&o.stats.saturdayMatches++,oe(o,l==="win"?"matchWin":l==="draw"?"matchDraw":"matchLoss"),r===0&&oe(o,"cleanSheet"),oe(o,"goalScored",s*5),o.lastMatch={...a,isHome:i,playerScore:s,opponentScore:r,resultType:l,opponent:n.name},o.week++,mn(o.standings)){const d=Ta();Na(d)}else $a();Ca(a,i,n.name);const c=ze(o);c.length>0&&setTimeout(()=>{c.forEach((d,u)=>{setTimeout(()=>{Ue(d)},u*1500)})},3e3),Fe(),Ge(),X(),P(),ke(),F(o)}function $a(){const e=gn(o.standings,o.week);e?o.nextMatch={opponent:e.name,time:Ze(),isHome:e.isHome,opponentPosition:e.position}:o.nextMatch={opponent:"Onbekende Tegenstander",time:Ze()}}function Ta(){const e=ut(o.standings,o.club.division);return e.promoted&&(o.stats.promotions++,oe(o,"promotion")),e.position===6&&o.stats.relegationEscapes++,e.isChampion&&oe(o,"title"),pn(o),e}function Ca(e,t,n){const i=document.getElementById("match-result-modal")||Aa(),a=t?e.homeScore:e.awayScore,s=t?e.awayScore:e.homeScore,r=ct(e.homeScore,e.awayScore,t),l=r==="win"?"result-win":r==="loss"?"result-loss":"result-draw",c=r==="win"?"Gewonnen!":r==="loss"?"Verloren":"Gelijkspel",d=i.querySelector(".modal-content")||i,u={goal:"⚽",own_goal:"⚽",yellow_card:"🟨",red_card:"🟥",substitution:"🔄",injury:"🤕",shot:"💨",shot_saved:"🧤",save:"🧤",foul:"⚠️",corner:"📐",free_kick:"🎯",penalty:"⚽",penalty_miss:"❌",chance:"💥"},f=e.events.filter(v=>["goal","own_goal","yellow_card","red_card","substitution","injury","penalty","penalty_miss"].includes(v.type)),m=t?e.possession.home:e.possession.away,p=t?e.possession.away:e.possession.home,h=t?e.shots.home:e.shots.away,g=t?e.shots.away:e.shots.home,x=t?e.shotsOnTarget.home:e.shotsOnTarget.away,k=t?e.shotsOnTarget.away:e.shotsOnTarget.home;d.innerHTML=`
        <div class="match-result-container">
            <div class="match-result-scoreboard ${l}">
                <div class="match-result-team home">
                    <span class="match-result-team-name">${o.club.name}</span>
                </div>
                <div class="match-result-score-display">
                    <span class="match-result-score-num">${a}</span>
                    <span class="match-result-score-sep">-</span>
                    <span class="match-result-score-num">${s}</span>
                </div>
                <div class="match-result-team away">
                    <span class="match-result-team-name">${n}</span>
                </div>
            </div>
            <div class="match-result-verdict">${c}</div>

            <div class="match-result-timeline">
                <h3>Wedstrijdverloop</h3>
                <div class="match-result-timeline-track">
                    ${f.map(v=>`
                        <div class="match-result-event ${v.type}">
                            <span class="match-result-event-icon">${u[v.type]||"📋"}</span>
                            <span class="match-result-event-minute">${v.minute}'</span>
                            <span class="match-result-event-text">${v.commentary||v.description||v.type}</span>
                        </div>
                    `).join("")}
                    ${f.length===0?'<div class="match-result-event"><span class="match-result-event-text">Geen bijzondere gebeurtenissen</span></div>':""}
                </div>
            </div>

            <div class="match-result-stats">
                <h3>Statistieken</h3>
                <div class="match-result-stat-row">
                    <span class="match-result-stat-value">${m}%</span>
                    <div class="match-result-stat-bar-container">
                        <span class="match-result-stat-label">Balbezit</span>
                        <div class="match-result-stat-bar">
                            <div class="match-result-stat-fill home" style="width: ${m}%"></div>
                            <div class="match-result-stat-fill away" style="width: ${p}%"></div>
                        </div>
                    </div>
                    <span class="match-result-stat-value">${p}%</span>
                </div>
                <div class="match-result-stat-row">
                    <span class="match-result-stat-value">${h}</span>
                    <div class="match-result-stat-bar-container">
                        <span class="match-result-stat-label">Schoten</span>
                        <div class="match-result-stat-bar">
                            <div class="match-result-stat-fill home" style="width: ${h+g>0?h/(h+g)*100:50}%"></div>
                            <div class="match-result-stat-fill away" style="width: ${h+g>0?g/(h+g)*100:50}%"></div>
                        </div>
                    </div>
                    <span class="match-result-stat-value">${g}</span>
                </div>
                <div class="match-result-stat-row">
                    <span class="match-result-stat-value">${x}</span>
                    <div class="match-result-stat-bar-container">
                        <span class="match-result-stat-label">Op doel</span>
                        <div class="match-result-stat-bar">
                            <div class="match-result-stat-fill home" style="width: ${x+k>0?x/(x+k)*100:50}%"></div>
                            <div class="match-result-stat-fill away" style="width: ${x+k>0?k/(x+k)*100:50}%"></div>
                        </div>
                    </div>
                    <span class="match-result-stat-value">${k}</span>
                </div>
            </div>

            ${e.manOfTheMatch?`
                <div class="match-result-motm">
                    <div class="match-result-motm-star">&#11088;</div>
                    <div class="match-result-motm-info">
                        <span class="match-result-motm-label">Man of the Match</span>
                        <span class="match-result-motm-name">${e.manOfTheMatch.name}</span>
                        ${e.manOfTheMatch.rating?`<span class="match-result-motm-rating">${e.manOfTheMatch.rating.toFixed(1)}</span>`:""}
                    </div>
                </div>
            `:""}

            <button class="btn btn-primary match-result-close-btn" onclick="closeMatchResultModal()">Sluiten</button>
        </div>
    `,i.style.display="flex"}function Aa(){const e=document.createElement("div");return e.id="match-result-modal",e.className="modal",e.innerHTML='<div class="modal-content match-result-content"></div>',document.body.appendChild(e),e}function Ia(){const e=document.getElementById("match-result-modal");e&&(e.style.display="none")}window.closeMatchResultModal=Ia;function Ba(e){const t=document.getElementById("daily-reward-modal")||La(),n=t.querySelector(".modal-content")||t,i=Array(7).fill(0).map((a,s)=>{const r=s<e.streakDay;return`<span class="streak-dot ${r?"active":""}">${r?"✓":s+1}</span>`}).join("");n.innerHTML=`
        <div class="daily-reward-header">
            <h2>🎁 Dagelijkse Beloning!</h2>
            <p>${e.reward.description}</p>
        </div>
        <div class="reward-amount">
            <span class="reward-icon">💰</span>
            <span class="reward-value">+${b(e.reward.amount)}</span>
        </div>
        <div class="streak-display">
            <h3>Streak: ${e.streak} dagen</h3>
            <div class="streak-dots">${i}</div>
            ${e.streakDay===7?'<p class="streak-complete">🎉 Week voltooid! Extra bonus!</p>':""}
        </div>
        <button class="btn btn-primary" onclick="closeDailyRewardModal()">Bedankt!</button>
    `,t.style.display="flex"}function La(){const e=document.createElement("div");return e.id="daily-reward-modal",e.className="modal",e.innerHTML='<div class="modal-content daily-reward-content"></div>',document.body.appendChild(e),e}function Da(){const e=document.getElementById("daily-reward-modal");e&&(e.style.display="none")}window.closeDailyRewardModal=Da;function Pa(e){const t=document.getElementById("offline-modal")||ja(),n=t.querySelector(".modal-content")||t;n.innerHTML=`
        <div class="offline-header">
            <h2>⏰ Welkom Terug!</h2>
            <p>Je was ${e.hoursAway} uur weg. Dit is er gebeurd:</p>
        </div>
        <div class="offline-progress">
            ${e.energyRecovered>0?`
                <div class="progress-item">
                    <span class="progress-icon">⚡</span>
                    <span>Spelers hersteld: +${e.energyRecovered}% energie</span>
                </div>
            `:""}
            ${e.trainingSessions>0?`
                <div class="progress-item">
                    <span class="progress-icon">🏋️</span>
                    <span>${e.trainingSessions} trainingssessie(s) voltooid</span>
                </div>
            `:""}
            ${e.scoutMissionsCompleted>0?`
                <div class="progress-item">
                    <span class="progress-icon">🔭</span>
                    <span>Scout missie voltooid!</span>
                </div>
            `:""}
            ${e.matchesReady?`
                <div class="progress-item">
                    <span class="progress-icon">⚽</span>
                    <span>Wedstrijd staat klaar om gespeeld te worden!</span>
                </div>
            `:""}
        </div>
        <button class="btn btn-primary" onclick="closeOfflineModal()">Verder spelen</button>
    `,t.style.display="flex"}function ja(){const e=document.createElement("div");return e.id="offline-modal",e.className="modal",e.innerHTML='<div class="modal-content offline-content"></div>',document.body.appendChild(e),e}function Ra(){const e=document.getElementById("offline-modal");e&&(e.style.display="none")}window.closeOfflineModal=Ra;function Ue(e){const t=document.createElement("div");t.className="achievement-toast",t.innerHTML=`
        <span class="achievement-icon">${e.icon}</span>
        <div class="achievement-info">
            <span class="achievement-label">Prestatie ontgrendeld!</span>
            <span class="achievement-name">${e.name}</span>
            ${e.reward?.cash?`<span class="achievement-reward">+${b(e.reward.cash)}</span>`:""}
        </div>
    `,document.body.appendChild(t),setTimeout(()=>t.classList.add("show"),100),setTimeout(()=>{t.classList.remove("show"),setTimeout(()=>t.remove(),500)},4e3)}function Na(e){const t=document.getElementById("season-end-modal")||Va(),n=t.querySelector(".modal-content")||t,i=e.promoted?"⬆️ PROMOTIE!":e.relegated?"⬇️ DEGRADATIE":e.isChampion?"🏆 KAMPIOEN!":"Seizoen Afgelopen",a=e.promoted||e.isChampion?"status-good":e.relegated?"status-bad":"status-neutral",s=ne(e.newDivision)?.name||"Onbekend";n.innerHTML=`
        <div class="season-end-header ${a}">
            <h2>${i}</h2>
            <p>Seizoen ${o.season-1} is afgelopen</p>
        </div>
        <div class="season-stats">
            <div class="stat-item">
                <span class="stat-value">${e.position}e</span>
                <span class="stat-label">Eindstand</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${e.points}</span>
                <span class="stat-label">Punten</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${e.won}-${e.drawn}-${e.lost}</span>
                <span class="stat-label">W-G-V</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${e.goalsFor}-${e.goalsAgainst}</span>
                <span class="stat-label">Doelsaldo</span>
            </div>
        </div>
        <div class="new-season-info">
            <h3>Nieuw Seizoen</h3>
            <p>Je speelt volgend seizoen in de <strong>${s}</strong></p>
        </div>
        <button class="btn btn-primary" onclick="closeSeasonEndModal()">Start Nieuw Seizoen</button>
    `,t.style.display="flex"}function Va(){const e=document.createElement("div");return e.id="season-end-modal",e.className="modal",e.innerHTML='<div class="modal-content season-end-content"></div>',document.body.appendChild(e),e}function qa(){const e=document.getElementById("season-end-modal");e&&(e.style.display="none"),Fe(),Ge(),X(),P(),ke()}window.closeSeasonEndModal=qa;function _a(){if(!ht(o))return;const e=kn(o,1);if(e.length===0)return;const t=e[0];o.activeEvent=t,Oa(t)}function Oa(e){const t=document.getElementById("event-modal")||za(),n=t.querySelector(".modal-content")||t,i=e.choices.map((a,s)=>{const r=a.condition&&!a.condition(o);return`
            <button class="btn ${r?"btn-disabled":"btn-secondary"}"
                    ${r?"disabled":""}
                    onclick="handleEventChoice(${s})">
                ${a.text}
            </button>
        `}).join("");n.innerHTML=`
        <div class="event-header">
            <span class="event-icon">${e.icon}</span>
            <h2>${e.title}</h2>
        </div>
        <div class="event-message">
            <p>${e.message}</p>
        </div>
        <div class="event-choices">
            ${i}
        </div>
    `,t.style.display="flex"}function za(){const e=document.createElement("div");return e.id="event-modal",e.className="modal",e.innerHTML='<div class="modal-content event-content"></div>',document.body.appendChild(e),e}function Ha(e){const t=o.activeEvent;if(!t)return;wn(o,t,e),En(o,t,e),o.activeEvent=null;const n=document.getElementById("event-modal");n&&(n.style.display="none"),E("Keuze gemaakt!","success"),P(),X(),ze(o).forEach((a,s)=>{setTimeout(()=>Ue(a),s*1500)}),F(o)}window.handleEventChoice=Ha;function Fa(){const e=document.getElementById("save-game-btn");e&&e.addEventListener("click",()=>{F(o),E("Spel opgeslagen!","success")});const t=document.getElementById("export-save-btn");t&&t.addEventListener("click",()=>{en(o),E("Save geëxporteerd!","success")});const n=document.getElementById("import-save-btn");n&&n.addEventListener("click",()=>{const i=document.createElement("input");i.type="file",i.accept=".json",i.onchange=async a=>{const s=a.target.files[0];if(s)try{const r=await tn(s);lt(r),E("Save geïmporteerd! Pagina wordt herladen...","success"),setTimeout(()=>location.reload(),1500)}catch(r){E("Fout bij importeren: "+r.message,"error")}},i.click()})}const Ga={stable:{name:"Bakkerij De Ouderwetse",tagline:"Al 40 jaar hetzelfde recept",description:"Betrouwbaar als roggebrood. Geen verrassingen, gewoon elke week je geld.",matchIncome:500,winBonus:0,icon:"🥖"},balanced:{name:"Café Het Gouden Paard",tagline:"Soms is het druk, soms niet",description:"Gezellig kroegje met een gokkast achter. Winnen levert bonusrondes op.",matchIncome:300,winBonus:250,icon:"🍺"},risky:{name:"Casino Jackpot Jansen",tagline:"Alles of niks, net als roulette",description:"Betaalt bijna niks, tenzij je wint. Dan regent het munten.",matchIncome:100,winBonus:600,icon:"🎰"}},qe={none:{name:"Geen netwerk",description:"Je vindt geen nieuwe jeugdspelers",weeklyCost:0,chancePerWeek:0,potentialRange:[0,0],icon:"❌"},local:{name:"Lokaal netwerk",description:"Scout in je eigen gemeente",weeklyCost:50,chancePerWeek:.15,potentialRange:[25,40],icon:"🏘️"},regional:{name:"Regionaal netwerk",description:"Scout in de hele regio",weeklyCost:150,chancePerWeek:.25,potentialRange:[35,50],icon:"🗺️"},national:{name:"Nationaal netwerk",description:"Scout door heel Nederland",weeklyCost:400,chancePerWeek:.35,potentialRange:[45,65],icon:"🇳🇱"},international:{name:"Internationaal netwerk",description:"Scout over de hele wereld",weeklyCost:800,chancePerWeek:.45,potentialRange:[55,80],icon:"🌍"}};function Ka(e){const t=Ga[e];if(!t)return;o.sponsor={id:e,name:t.name,matchIncome:t.matchIncome,winBonus:t.winBonus,weeklyPay:t.matchIncome,icon:t.icon},Bt(),document.querySelectorAll(".sponsor-block").forEach(a=>{a.classList.remove("active")});const n=document.querySelector(`.sponsor-block[data-sponsor="${e}"]`);n&&n.classList.add("active"),document.querySelectorAll(".sponsor-card-compact").forEach(a=>{a.classList.remove("active")});const i=document.querySelector(`.sponsor-card-compact[data-sponsor="${e}"]`);i&&i.classList.add("active"),E(`${t.name} is nu je shirtsponsor!`,"success"),F()}function Bt(){const e=document.getElementById("kit-display"),t=document.getElementById("current-sponsor-name"),n=document.getElementById("current-sponsor-earnings"),i=document.getElementById("shirt-sponsor-line1"),a=document.getElementById("shirt-sponsor-line2"),s=o.club?.colors?.primary||"#1b5e20",r=o.club?.colors?.secondary||"#f5f0e1";if(e&&(e.style.setProperty("--shirt-primary",s),e.style.setProperty("--shirt-secondary",r)),o.sponsor){const l=o.sponsor.name.split(" ");let c="",d="";const u=Math.ceil(l.length/2);c=l.slice(0,u).join(" "),d=l.slice(u).join(" "),i&&(i.textContent=c.toUpperCase()),a&&(a.textContent=d.toUpperCase()),t&&(t.textContent=o.sponsor.name),n&&(n.textContent=`€${o.sponsor.matchIncome} per wedstrijd`)}else i&&(i.textContent="GEEN"),a&&(a.textContent="SPONSOR"),t&&(t.textContent="Geen sponsor"),n&&(n.textContent="€0 per wedstrijd")}function Lt(){Bt()}function Ya(){if(Lt(),document.querySelectorAll(".sponsor-card-compact").forEach(e=>{e.classList.remove("active")}),o.sponsor?.id){const e=document.querySelector(`.sponsor-card-compact[data-sponsor="${o.sponsor.id}"]`);e&&e.classList.add("active")}}window.selectSponsor=Ka;window.updateSponsorShirtDisplay=Lt;function Dt(){const e=document.getElementById("scouting-network-options"),t=document.getElementById("current-network-name");if(!e)return;const n=qe[o.scoutingNetwork];t&&n&&(t.textContent=n.name);let i="";for(const[a,s]of Object.entries(qe)){const r=o.scoutingNetwork===a,l=a==="none"?"Gratis":`€${s.weeklyCost}/w`;i+=`
            <button class="network-chip ${r?"active":""}" onclick="selectScoutingNetwork('${a}')">
                <span class="nc-icon">${s.icon}</span>
                <span class="nc-name">${s.name.replace(" netwerk","")}</span>
                <span class="nc-cost">${l}</span>
            </button>
        `}e.innerHTML=i}function Wa(e){const t=qe[e];t&&(o.scoutingNetwork=e,Dt(),e==="none"?E("Jeugdscoutingnetwerk uitgeschakeld","info"):E(`${t.name} geactiveerd! Kosten: €${t.weeklyCost}/week`,"success"))}window.selectScoutingNetwork=Wa;const Pt={trainingcamp:{name:"Trainingskamp",cost:2500,effect:"fitness",value:2},teamparty:{name:"Teamuitje",cost:1e3,effect:"chemistry",value:10},tactical:{name:"Tactische Sessie",cost:500,effect:"tactics",value:5}};function Ua(e){const t=Pt[e];if(t){if(o.club.budget<t.cost){E("Niet genoeg budget voor deze activiteit!","error");return}o.club.budget-=t.cost,t.effect==="fitness"?(o.players.forEach(n=>{n.attributes.FYS&&(n.attributes.FYS=Math.min(99,n.attributes.FYS+t.value))}),E(`Trainingskamp afgerond! Alle spelers +${t.value} FYS`,"success")):t.effect==="chemistry"?(o.teamChemistry=(o.teamChemistry||50)+t.value,E(`Teamuitje geslaagd! +${t.value}% teamchemie`,"success")):t.effect==="tactics"&&(o.nextMatchBonus=(o.nextMatchBonus||0)+t.value,E(`Tactische sessie gedaan! +${t.value}% volgende wedstrijd`,"success")),updateUI()}}function Ja(){document.querySelectorAll(".activity-card").forEach(e=>{const t=e.dataset.activity,n=Pt[t];if(n){const i=e.querySelector(".activity-cost");i&&(i.textContent=b(n.cost));const a=e.querySelector(".activity-btn");a&&(o.club.budget<n.cost?(a.disabled=!0,a.textContent="Te weinig budget"):(a.disabled=!1,a.textContent="Uitvoeren"))}})}window.startActivity=Ua;const Za=[{id:"tr_keeper",name:"Keeperstrainer",icon:"🧤",cost:3e3,salary:200,effect:"Train keepers",position:"keeper"},{id:"tr_verdediging",name:"Verdedigingstrainer",icon:"🛡️",cost:3e3,salary:200,effect:"Train verdedigers",position:"verdediging"},{id:"tr_middenveld",name:"Middenveldtrainer",icon:"⚙️",cost:3e3,salary:200,effect:"Train middenvelders",position:"middenveld"},{id:"tr_aanval",name:"Aanvalstrainer",icon:"⚽",cost:3e3,salary:200,effect:"Train aanvallers",position:"aanval"},{id:"tr_conditie",name:"Conditietrainer",icon:"💪",cost:4e3,salary:300,effect:"+10% fitness hele team",position:"conditie"}],Qa=[{id:"st_assistent",name:"Assistent Manager",icon:"👔",cost:5e3,salary:400,effect:"+5% team prestatie"},{id:"st_fysio",name:"Fysiotherapeut",icon:"🏥",cost:4e3,salary:300,effect:"Sneller blessure herstel"},{id:"st_arts",name:"Clubarts",icon:"⚕️",cost:8e3,salary:500,effect:"Minder blessures"},{id:"st_mascotte",name:"Mascotte",icon:"🦁",cost:2e3,salary:100,effect:"+5% thuisvoordeel"}];window.hireScoutDirect=function(){if(o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]}),o.hiredStaff.medisch||(o.hiredStaff.medisch=[]),o.hiredStaff.medisch.includes("st_scout")){E("Je hebt al een scout!","info");return}if(o.club.budget<1){E("Niet genoeg budget!","error");return}o.club.budget-=1,o.hiredStaff.medisch.push("st_scout"),P(),ie(),F(),E("Scout aangenomen! Je kunt nu scouten.","success")};function jt(){Xa(),es()}function Xa(){const e=document.getElementById("trainers-staff-grid");if(!e)return;o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]});let t="";Za.forEach(n=>{const i=o.hiredStaff.trainers?.includes(n.id);t+=Rt(n,i,"trainers")}),e.innerHTML=t}function es(){const e=document.getElementById("medisch-staff-grid");if(!e)return;o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]});let t="";Qa.forEach(n=>{const i=o.hiredStaff.medisch?.includes(n.id);t+=Rt(n,i,"medisch")}),e.innerHTML=t}function Rt(e,t,n){return`
        <div class="staff-hire-card ${t?"hired":""}">
            <div class="shc-icon">${e.icon}</div>
            <div class="shc-name">${e.name}</div>
            <div class="shc-desc">${e.effect}</div>
            ${t?`
                <div class="shc-status">✓ In dienst</div>
                <div class="shc-cost">€${e.salary}/week</div>
            `:`
                <div class="shc-cost">€${e.cost}</div>
                <button class="btn btn-sm btn-primary" onclick="hireStaff('${n}', '${e.id}', ${e.cost})">
                    Aannemen
                </button>
            `}
        </div>
    `}window.hireStaff=function(e,t,n){if(o.club.budget<n){E("Niet genoeg budget!","error");return}o.hiredStaff||(o.hiredStaff={trainers:[],medisch:[]}),o.hiredStaff[e]||(o.hiredStaff[e]=[]),o.hiredStaff[e].includes(t)||(o.hiredStaff[e].push(t),o.club.budget-=n,P(),jt(),F(),E("Stafmedewerker aangenomen!","success"))};window.startScoutSearchFromStaff=function(){const e=parseInt(document.getElementById("scout-min-age-staff")?.value)||16,t=parseInt(document.getElementById("scout-max-age-staff")?.value)||35,n=document.getElementById("scout-position-staff")?.value||"all";o.scoutSearch={minAge:e,maxAge:t,position:n,results:[]};const i=[];for(let a=0;a<5;a++){const s=L(n==="all"?null:n,e+Math.floor(Math.random()*(t-e)),o.club.division);s.price=Math.floor(s.overall*100+Math.random()*5e3),i.push(s)}o.scoutSearch.results=i,renderScoutResults()};function Nt(){jt()}window.hireStaffMember=function(e,t,n){if(o.club.budget<n){alert("Niet genoeg budget!");return}o.staffCenter||(o.staffCenter={assistantManager:[],medicalStaff:[],scoutStaff:[]}),o.staffCenter[e].includes(t)||(o.club.budget-=n,o.staffCenter[e].push(t),P(),Nt(),E("Nieuw staflid aangenomen!","success"))};function ts(){const e=document.getElementById("corner-taker"),t=document.getElementById("penalty-taker"),n=document.getElementById("freekick-taker"),i=document.getElementById("captain-select");if(!e||!t||!n||!i)return;const s=[...o.players.filter(l=>!l.injured)].sort((l,c)=>{const d={K:1,V:2,M:3,A:4};return(d[l.position]||5)-(d[c.position]||5)}),r=(l,c)=>{let d='<option value="">-- Selecteer speler --</option>';return l.forEach(u=>{const f=u.id===c?"selected":"",m={K:"Keeper",V:"Verdediger",M:"Middenvelder",A:"Aanvaller"}[u.position]||u.position;d+=`<option value="${u.id}" ${f}>${u.name} (${m} - ${u.overall})</option>`}),d};o.specialists||(o.specialists={cornerTaker:null,penaltyTaker:null,freekickTaker:null,captain:null}),e.innerHTML=r(s,o.specialists.cornerTaker),t.innerHTML=r(s,o.specialists.penaltyTaker),n.innerHTML=r(s,o.specialists.freekickTaker),i.innerHTML=r(s,o.specialists.captain),e.onchange=l=>{o.specialists.cornerTaker=l.target.value||null,E("Cornernemer ingesteld","success")},t.onchange=l=>{o.specialists.penaltyTaker=l.target.value||null,E("Strafschopnemer ingesteld","success")},n.onchange=l=>{o.specialists.freekickTaker=l.target.value||null,E("Vrije trap nemer ingesteld","success")},i.onchange=l=>{o.specialists.captain=l.target.value||null,E("Aanvoerder ingesteld","success")}}const W={tribune:{description:"Vergroot de capaciteit om meer supporters te ontvangen en meer wedstrijdinkomsten te genereren.",levels:[{id:"tribune_1",name:"Houten Tribune",capacity:200,cost:0,effect:"200 toeschouwers"},{id:"tribune_2",name:"Stenen Tribune",capacity:500,cost:5e3,effect:"500 toeschouwers"},{id:"tribune_3",name:"Overdekte Tribune",capacity:1e3,cost:15e3,effect:"1.000 toeschouwers"},{id:"tribune_4",name:"Moderne Tribune",capacity:2500,cost:4e4,effect:"2.500 toeschouwers",reqCapacity:500},{id:"tribune_5",name:"Stadion Tribune",capacity:5e3,cost:1e5,effect:"5.000 toeschouwers",reqCapacity:1e3}],stateKey:"tribune"},grass:{description:"Beter gras geeft je team een thuisvoordeel tijdens wedstrijden.",levels:[{id:"grass_0",name:"Basis Gras",cost:0,effect:"Geen bonus"},{id:"grass_1",name:"Onderhouden Gras",cost:3e3,effect:"+5% thuisvoordeel"},{id:"grass_2",name:"Professioneel Gras",cost:8e3,effect:"+10% thuisvoordeel",reqCapacity:500},{id:"grass_3",name:"Kunstgras",cost:2e4,effect:"+15% thuisvoordeel",reqCapacity:1e3}],stateKey:"grass"},training:{description:"Beter trainingsfaciliteiten zorgen ervoor dat spelers sneller verbeteren.",levels:[{id:"train_1",name:"Basisveld",cost:0,effect:"+5% trainingssnelheid"},{id:"train_2",name:"Trainingsveld",cost:5e3,effect:"+10% trainingssnelheid"},{id:"train_3",name:"Modern Complex",cost:15e3,effect:"+20% trainingssnelheid",reqCapacity:500},{id:"train_4",name:"Elite Complex",cost:4e4,effect:"+30% trainingssnelheid",reqCapacity:1e3}],stateKey:"training"},medical:{description:"Betere medische voorzieningen verkorten de hersteltijd van geblesseerde spelers.",levels:[{id:"med_1",name:"EHBO Kist",cost:0,effect:"-10% blessureduur"},{id:"med_2",name:"Medische Kamer",cost:4e3,effect:"-20% blessureduur"},{id:"med_3",name:"Fysiotherapie",cost:12e3,effect:"-35% blessureduur",reqCapacity:500},{id:"med_4",name:"Medisch Centrum",cost:3e4,effect:"-50% blessureduur",reqCapacity:1e3}],stateKey:"medical"},academy:{description:"Een betere jeugdopleiding produceert talentvoller spelers.",levels:[{id:"acad_1",name:"Jeugdelftal",cost:0,effect:"Basistalent (40-55)"},{id:"acad_2",name:"Jeugdopleiding",cost:6e3,effect:"Beter talent (45-60)"},{id:"acad_3",name:"Voetbalschool",cost:18e3,effect:"Goed talent (50-65)",reqCapacity:500},{id:"acad_4",name:"Topacademie",cost:5e4,effect:"Toptalent (55-75)",reqCapacity:1e3}],stateKey:"academy"},scouting:{description:"Een groter scoutingnetwerk vindt betere en meer spelers.",levels:[{id:"scout_1",name:"Basisnetwerk",cost:0,effect:"Lokaal scouten"},{id:"scout_2",name:"Regionaal Netwerk",cost:4e3,effect:"Regionaal scouten"},{id:"scout_3",name:"Nationaal Netwerk",cost:12e3,effect:"Nationaal scouten",reqCapacity:500},{id:"scout_4",name:"Internationaal",cost:35e3,effect:"Internationaal scouten",reqCapacity:1e3}],stateKey:"scouting"},youthscouting:{description:"Betere jeugdscouting vindt talentvoller jeugdspelers voor je academie.",levels:[{id:"ysct_1",name:"Lokale Scouts",cost:0,effect:"Basis jeugdtalent"},{id:"ysct_2",name:"Regionale Scouts",cost:5e3,effect:"Beter jeugdtalent"},{id:"ysct_3",name:"Nationale Scouts",cost:15e3,effect:"Goed jeugdtalent",reqCapacity:500},{id:"ysct_4",name:"Elite Scouts",cost:4e4,effect:"Top jeugdtalent",reqCapacity:1e3}],stateKey:"youthscouting"},kantine:{description:"De kantine genereert extra inkomsten tijdens wedstrijden.",levels:[{id:"kantine_1",name:"Koffiehoek",cost:0,effect:"€50 per wedstrijd"},{id:"kantine_2",name:"Clubkantine",cost:3e3,effect:"€150 per wedstrijd"},{id:"kantine_3",name:"Restaurant",cost:1e4,effect:"€400 per wedstrijd",reqCapacity:500},{id:"kantine_4",name:"Horeca Complex",cost:25e3,effect:"€800 per wedstrijd",reqCapacity:1e3}],stateKey:"kantine"},sponsoring:{description:"Betere sponsorfaciliteiten trekken rijkere sponsors aan.",levels:[{id:"sponsor_1",name:"Lokale Sponsors",cost:0,effect:"Basis sponsordeals"},{id:"sponsor_2",name:"Regionale Sponsors",cost:5e3,effect:"Betere deals"},{id:"sponsor_3",name:"Grote Sponsors",cost:15e3,effect:"Premium deals",reqCapacity:500},{id:"sponsor_4",name:"Hoofdsponsors",cost:4e4,effect:"Top sponsordeals",reqCapacity:1e3}],stateKey:"sponsoring"},perszaal:{description:"Mediafaciliteiten vergroten de reputatie en bekendheid van je club.",levels:[{id:"pers_1",name:"Interview Hoek",cost:0,effect:"+5% reputatie"},{id:"pers_2",name:"Perszaal",cost:4e3,effect:"+10% reputatie"},{id:"pers_3",name:"Mediacentrum",cost:12e3,effect:"+20% reputatie",reqCapacity:500},{id:"pers_4",name:"Perscomplex",cost:3e4,effect:"+35% reputatie",reqCapacity:1e3}],stateKey:"perszaal"}};function Vt(){const e=document.getElementById("stadium-tiles-grid");if(!e)return;Object.entries(W).forEach(([n,i])=>{const a=o.stadium[i.stateKey],s=i.levels.findIndex(g=>g.id===a),r=i.levels[s]||i.levels[0],l=i.levels[s+1],c=!l,d=(s+1)/i.levels.length*100,u=document.getElementById(`tile-${n}-level`),f=document.getElementById(`tile-${n}-effect`),m=document.getElementById(`tile-${n}-cost`),p=document.getElementById(`tile-${n}-progress`),h=e.querySelector(`[data-category="${n}"]`);u&&(u.textContent=r.name),f&&(f.textContent=r.effect),m&&(m.textContent=c?"":b(l.cost),c&&(m.innerHTML='<span class="tile-max">MAX</span>')),p&&(p.style.width=`${d}%`),h&&h.classList.toggle("maxed",c)});const t=document.getElementById("stadium-capacity");t&&(t.textContent=o.stadium.capacity||200)}function ns(e){const t=W[e];if(!t)return;const n=o.stadium[t.stateKey],i=t.levels.findIndex(c=>c.id===n),a=t.levels[i+1];if(!a){E("Dit is al op het hoogste niveau!","info");return}const s=o.club.budget>=a.cost,r={tribune:"Tribune",grass:"Grasveld",training:"Training",medical:"Medisch",academy:"Jeugdopleiding",scouting:"Scouting",kantine:"Kantine",sponsoring:"Sponsoring",perszaal:"Perszaal"},l=document.createElement("div");l.className="modal-overlay",l.innerHTML=`
        <div class="modal stadium-upgrade-modal">
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h2>Upgrade ${r[e]}</h2>
            <div class="upgrade-details">
                <div class="upgrade-from">
                    <h4>Huidig</h4>
                    <p class="level-name">${t.levels[i].name}</p>
                    <p class="level-effect">${t.levels[i].effect}</p>
                </div>
                <div class="upgrade-arrow">→</div>
                <div class="upgrade-to">
                    <h4>Upgrade naar</h4>
                    <p class="level-name">${a.name}</p>
                    <p class="level-effect">${a.effect}</p>
                </div>
            </div>
            <div class="upgrade-cost">
                <span class="cost-label">Kosten:</span>
                <span class="cost-value ${s?"":"cannot-afford"}">${b(a.cost)}</span>
            </div>
            <div class="upgrade-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuleren</button>
                <button class="btn btn-primary" ${s?"":"disabled"} onclick="upgradeStadiumTile('${e}')">
                    ${s?"Upgraden":"Niet genoeg budget"}
                </button>
            </div>
        </div>
    `,document.body.appendChild(l)}function is(e){const t=W[e];if(!t)return;const n=o.stadium[t.stateKey],i=t.levels.findIndex(s=>s.id===n),a=t.levels[i+1];if(!a||o.club.budget<a.cost){E("Upgrade niet mogelijk!","error");return}o.club.budget-=a.cost,o.stadium[t.stateKey]=a.id,e==="tribune"&&a.capacity&&(o.stadium.capacity=a.capacity),document.querySelector(".modal-overlay")?.remove(),Vt(),P(),E(`${a.name} gebouwd!`,"success")}window.showStadiumUpgradeModal=ns;window.upgradeStadiumTile=is;let qt="tribune";function _t(e){qt=e,document.querySelectorAll(".stadium-cat").forEach(t=>{t.classList.remove("active"),t.dataset.category===e&&t.classList.add("active")}),Ot(e)}function as(e,t){const i={tribune:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="120" width="400" height="60" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="40" fill="#87CEEB"/>
                <rect x="30" y="60" width="340" height="60" fill="#8B4513"/>
                <rect x="40" y="65" width="45" height="50" fill="#A0522D"/><rect x="90" y="65" width="45" height="50" fill="#A0522D"/>
                <rect x="140" y="65" width="45" height="50" fill="#A0522D"/><rect x="190" y="65" width="45" height="50" fill="#A0522D"/>
                <rect x="240" y="65" width="45" height="50" fill="#A0522D"/><rect x="290" y="65" width="45" height="50" fill="#A0522D"/>
                <rect x="340" y="65" width="45" height="50" fill="#A0522D"/>
                <circle cx="62" cy="55" r="8" fill="#ffcc80"/><circle cx="112" cy="55" r="8" fill="#ffcc80"/>
                <circle cx="162" cy="55" r="8" fill="#ffcc80"/><circle cx="212" cy="55" r="8" fill="#ffcc80"/>
                <circle cx="262" cy="55" r="8" fill="#ffcc80"/><circle cx="312" cy="55" r="8" fill="#ffcc80"/>
                <circle cx="362" cy="55" r="8" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="130" width="400" height="50" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="30" fill="#87CEEB"/>
                <rect x="0" y="40" width="400" height="90" fill="#78909c"/>
                <rect x="5" y="45" width="55" height="35" fill="#90a4ae"/><rect x="65" y="45" width="55" height="35" fill="#90a4ae"/>
                <rect x="125" y="45" width="55" height="35" fill="#90a4ae"/><rect x="185" y="45" width="55" height="35" fill="#90a4ae"/>
                <rect x="245" y="45" width="55" height="35" fill="#90a4ae"/><rect x="305" y="45" width="55" height="35" fill="#90a4ae"/>
                <rect x="365" y="45" width="35" height="35" fill="#90a4ae"/>
                <rect x="5" y="85" width="55" height="35" fill="#b0bec5"/><rect x="65" y="85" width="55" height="35" fill="#b0bec5"/>
                <rect x="125" y="85" width="55" height="35" fill="#b0bec5"/><rect x="185" y="85" width="55" height="35" fill="#b0bec5"/>
                <rect x="245" y="85" width="55" height="35" fill="#b0bec5"/><rect x="305" y="85" width="55" height="35" fill="#b0bec5"/>
                <rect x="365" y="85" width="35" height="35" fill="#b0bec5"/>
                <circle cx="32" cy="38" r="7" fill="#ffcc80"/><circle cx="92" cy="38" r="7" fill="#ffcc80"/><circle cx="152" cy="38" r="7" fill="#ffcc80"/>
                <circle cx="212" cy="38" r="7" fill="#ffcc80"/><circle cx="272" cy="38" r="7" fill="#ffcc80"/><circle cx="332" cy="38" r="7" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="140" width="400" height="40" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="20" fill="#87CEEB"/>
                <rect x="0" y="30" width="400" height="110" fill="#607d8b"/>
                <polygon points="0,30 200,5 400,30" fill="#455a64"/>
                <rect x="5" y="38" width="50" height="28" fill="#78909c"/><rect x="60" y="38" width="50" height="28" fill="#78909c"/>
                <rect x="115" y="38" width="50" height="28" fill="#78909c"/><rect x="170" y="38" width="50" height="28" fill="#78909c"/>
                <rect x="230" y="38" width="50" height="28" fill="#78909c"/><rect x="285" y="38" width="50" height="28" fill="#78909c"/>
                <rect x="340" y="38" width="55" height="28" fill="#78909c"/>
                <rect x="5" y="70" width="50" height="28" fill="#90a4ae"/><rect x="60" y="70" width="50" height="28" fill="#90a4ae"/>
                <rect x="115" y="70" width="50" height="28" fill="#90a4ae"/><rect x="170" y="70" width="50" height="28" fill="#90a4ae"/>
                <rect x="230" y="70" width="50" height="28" fill="#90a4ae"/><rect x="285" y="70" width="50" height="28" fill="#90a4ae"/>
                <rect x="340" y="70" width="55" height="28" fill="#90a4ae"/>
                <rect x="5" y="102" width="50" height="28" fill="#b0bec5"/><rect x="60" y="102" width="50" height="28" fill="#b0bec5"/>
                <rect x="115" y="102" width="50" height="28" fill="#b0bec5"/><rect x="170" y="102" width="50" height="28" fill="#b0bec5"/>
                <rect x="230" y="102" width="50" height="28" fill="#b0bec5"/><rect x="285" y="102" width="50" height="28" fill="#b0bec5"/>
                <rect x="340" y="102" width="55" height="28" fill="#b0bec5"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="145" width="400" height="35" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="130" fill="#37474f"/>
                <rect x="0" y="0" width="400" height="18" fill="#263238"/>
                <rect x="5" y="22" width="38" height="22" fill="#1b5e20"/><rect x="48" y="22" width="38" height="22" fill="#1b5e20"/>
                <rect x="91" y="22" width="38" height="22" fill="#1b5e20"/><rect x="134" y="22" width="38" height="22" fill="#1b5e20"/>
                <rect x="177" y="22" width="38" height="22" fill="#ff9800"/><rect x="220" y="22" width="38" height="22" fill="#ff9800"/>
                <rect x="263" y="22" width="38" height="22" fill="#1b5e20"/><rect x="306" y="22" width="38" height="22" fill="#1b5e20"/>
                <rect x="349" y="22" width="50" height="22" fill="#1b5e20"/>
                <rect x="5" y="48" width="38" height="22" fill="#2e7d32"/><rect x="48" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="91" y="48" width="38" height="22" fill="#2e7d32"/><rect x="134" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="177" y="48" width="38" height="22" fill="#2e7d32"/><rect x="220" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="263" y="48" width="38" height="22" fill="#2e7d32"/><rect x="306" y="48" width="38" height="22" fill="#2e7d32"/>
                <rect x="349" y="48" width="50" height="22" fill="#2e7d32"/>
                <rect x="5" y="74" width="38" height="22" fill="#388e3c"/><rect x="48" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="91" y="74" width="38" height="22" fill="#388e3c"/><rect x="134" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="177" y="74" width="38" height="22" fill="#388e3c"/><rect x="220" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="263" y="74" width="38" height="22" fill="#388e3c"/><rect x="306" y="74" width="38" height="22" fill="#388e3c"/>
                <rect x="349" y="74" width="50" height="22" fill="#388e3c"/>
                <rect x="80" y="102" width="240" height="35" fill="#263238"/>
                <text x="200" y="125" text-anchor="middle" fill="#4caf50" font-size="14" font-family="sans-serif" font-weight="bold">VIP LOUNGE</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="150" width="400" height="30" fill="#4a7c4e"/>
                <ellipse cx="200" cy="155" rx="200" ry="50" fill="#37474f"/>
                <ellipse cx="200" cy="155" rx="160" ry="38" fill="#4a7c4e"/>
                <rect x="0" y="0" width="400" height="110" fill="#263238"/>
                <rect x="0" y="0" width="400" height="18" fill="#1b5e20"/>
                <rect x="175" y="20" width="50" height="85" fill="#ffeb3b" opacity="0.2"/>
                <text x="200" y="70" text-anchor="middle" fill="#ffeb3b" font-size="28" font-family="sans-serif">★</text>
                <rect x="5" y="22" width="35" height="18" fill="#1b5e20"/><rect x="45" y="22" width="35" height="18" fill="#1b5e20"/>
                <rect x="85" y="22" width="35" height="18" fill="#1b5e20"/><rect x="125" y="22" width="35" height="18" fill="#ff9800"/>
                <rect x="165" y="22" width="35" height="18" fill="#ff9800"/><rect x="245" y="22" width="35" height="18" fill="#ff9800"/>
                <rect x="285" y="22" width="35" height="18" fill="#1b5e20"/><rect x="325" y="22" width="35" height="18" fill="#1b5e20"/>
                <rect x="365" y="22" width="35" height="18" fill="#1b5e20"/>
                <circle cx="20" cy="130" r="5" fill="#fff176"/><circle cx="50" cy="130" r="5" fill="#fff176"/>
                <circle cx="80" cy="130" r="5" fill="#fff176"/><circle cx="110" cy="130" r="5" fill="#fff176"/>
                <circle cx="290" cy="130" r="5" fill="#fff176"/><circle cx="320" cy="130" r="5" fill="#fff176"/>
                <circle cx="350" cy="130" r="5" fill="#fff176"/><circle cx="380" cy="130" r="5" fill="#fff176"/>
            </svg>`],grass:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#8bc34a"/>
                <rect x="0" y="0" width="400" height="180" fill="#7cb342" stroke="white" stroke-width="3"/>
                <circle cx="200" cy="90" r="35" fill="none" stroke="white" stroke-width="3"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="3"/>
                <rect x="0" y="45" width="50" height="90" fill="none" stroke="white" stroke-width="3"/>
                <rect x="350" y="45" width="50" height="90" fill="none" stroke="white" stroke-width="3"/>
                <ellipse cx="100" cy="60" rx="20" ry="10" fill="#6a9c3a"/>
                <ellipse cx="300" cy="120" rx="25" ry="12" fill="#6a9c3a"/>
                <ellipse cx="150" cy="140" rx="30" ry="14" fill="#5d8a32"/>
                <ellipse cx="280" cy="50" rx="18" ry="9" fill="#5d8a32"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#81c784"/>
                <rect x="0" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="80" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="160" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="240" y="0" width="40" height="180" fill="#7cb342"/>
                <rect x="320" y="0" width="40" height="180" fill="#7cb342"/>
                <circle cx="200" cy="90" r="40" fill="none" stroke="white" stroke-width="3"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="3"/>
                <rect x="0" y="45" width="55" height="90" fill="none" stroke="white" stroke-width="3"/>
                <rect x="345" y="45" width="55" height="90" fill="none" stroke="white" stroke-width="3"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#4caf50"/>
                <rect x="0" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="70" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="140" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="210" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="280" y="0" width="35" height="180" fill="#66bb6a"/>
                <rect x="350" y="0" width="50" height="180" fill="#66bb6a"/>
                <circle cx="200" cy="90" r="45" fill="none" stroke="white" stroke-width="4"/>
                <circle cx="200" cy="90" r="5" fill="white"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="4"/>
                <rect x="0" y="35" width="65" height="110" fill="none" stroke="white" stroke-width="4"/>
                <rect x="335" y="35" width="65" height="110" fill="none" stroke="white" stroke-width="4"/>
                <rect x="0" y="55" width="32" height="70" fill="none" stroke="white" stroke-width="3"/>
                <rect x="368" y="55" width="32" height="70" fill="none" stroke="white" stroke-width="3"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#388e3c"/>
                <defs>
                    <pattern id="turf" patternUnits="userSpaceOnUse" width="20" height="20">
                        <rect width="20" height="20" fill="#43a047"/>
                        <rect x="0" y="0" width="10" height="10" fill="#4caf50"/>
                        <rect x="10" y="10" width="10" height="10" fill="#4caf50"/>
                    </pattern>
                </defs>
                <rect x="0" y="0" width="400" height="180" fill="url(#turf)" opacity="0.5"/>
                <circle cx="200" cy="90" r="50" fill="none" stroke="white" stroke-width="5"/>
                <circle cx="200" cy="90" r="6" fill="white"/>
                <line x1="200" y1="0" x2="200" y2="180" stroke="white" stroke-width="5"/>
                <rect x="0" y="30" width="75" height="120" fill="none" stroke="white" stroke-width="5"/>
                <rect x="325" y="30" width="75" height="120" fill="none" stroke="white" stroke-width="5"/>
                <rect x="0" y="50" width="38" height="80" fill="none" stroke="white" stroke-width="4"/>
                <rect x="362" y="50" width="38" height="80" fill="none" stroke="white" stroke-width="4"/>
                <circle cx="38" cy="90" r="4" fill="white"/><circle cx="362" cy="90" r="4" fill="white"/>
            </svg>`],training:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#8bc34a"/>
                <rect x="20" y="30" width="160" height="100" fill="#7cb342" stroke="#fff" stroke-width="3" stroke-dasharray="8,4"/>
                <circle cx="320" cy="80" r="45" fill="none" stroke="white" stroke-width="3"/>
                <rect x="250" y="130" width="130" height="50" fill="#5d4037"/>
                <rect x="260" y="138" width="110" height="35" fill="#8d6e63"/>
                <circle cx="100" cy="80" r="12" fill="#fff"/><circle cx="100" cy="80" r="6" fill="#333"/>
                <line x1="200" y1="60" x2="200" y2="100" stroke="#fff" stroke-width="4"/>
                <line x1="175" y1="80" x2="225" y2="80" stroke="#fff" stroke-width="4"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#7cb342"/>
                <rect x="0" y="15" width="190" height="100" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="210" y="15" width="190" height="100" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="10" y="130" width="80" height="45" fill="#5d4037"/><rect x="110" y="130" width="80" height="45" fill="#5d4037"/>
                <rect x="210" y="130" width="80" height="45" fill="#5d4037"/><rect x="310" y="130" width="80" height="45" fill="#5d4037"/>
                <circle cx="95" cy="65" r="30" fill="none" stroke="#fff" stroke-width="3"/>
                <circle cx="305" cy="65" r="30" fill="none" stroke="#fff" stroke-width="3"/>
                <rect x="50" y="25" width="10" height="60" fill="#ff9800"/><rect x="130" y="25" width="10" height="60" fill="#ff9800"/>
                <rect x="260" y="25" width="10" height="60" fill="#2196f3"/><rect x="340" y="25" width="10" height="60" fill="#2196f3"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#558b2f"/>
                <rect x="0" y="5" width="195" height="85" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="205" y="5" width="195" height="85" fill="#689f38" stroke="#fff" stroke-width="3"/>
                <rect x="0" y="100" width="130" height="80" fill="#455a64"/>
                <rect x="10" y="110" width="50" height="28" fill="#78909c"/><rect x="70" y="110" width="50" height="28" fill="#78909c"/>
                <rect x="10" y="145" width="50" height="28" fill="#78909c"/><rect x="70" y="145" width="50" height="28" fill="#78909c"/>
                <rect x="140" y="100" width="120" height="80" fill="#37474f"/>
                <text x="200" y="148" text-anchor="middle" fill="#4caf50" font-size="14" font-family="sans-serif" font-weight="bold">FITNESS</text>
                <rect x="270" y="100" width="130" height="80" fill="#455a64"/>
                <circle cx="335" cy="140" r="28" fill="#29b6f6"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#33691e"/>
                <rect x="0" y="0" width="130" height="60" fill="#558b2f" stroke="#ffd700" stroke-width="2"/>
                <rect x="135" y="0" width="130" height="60" fill="#558b2f" stroke="#ffd700" stroke-width="2"/>
                <rect x="270" y="0" width="130" height="60" fill="#558b2f" stroke="#ffd700" stroke-width="2"/>
                <rect x="0" y="65" width="200" height="55" fill="#263238"/>
                <text x="100" y="98" text-anchor="middle" fill="#ffd700" font-size="14" font-family="sans-serif" font-weight="bold">⭐ ELITE GYM ⭐</text>
                <rect x="200" y="65" width="200" height="55" fill="#1565c0"/>
                <text x="300" y="98" text-anchor="middle" fill="white" font-size="14" font-family="sans-serif" font-weight="bold">🏊 ZWEMBAD</text>
                <rect x="0" y="125" width="133" height="55" fill="#37474f"/>
                <text x="66" y="158" text-anchor="middle" fill="#4caf50" font-size="11" font-family="sans-serif">ANALYSE LAB</text>
                <rect x="133" y="125" width="134" height="55" fill="#4e342e"/>
                <text x="200" y="158" text-anchor="middle" fill="#ffcc80" font-size="11" font-family="sans-serif">SAUNA</text>
                <rect x="267" y="125" width="133" height="55" fill="#1b5e20"/>
                <text x="333" y="158" text-anchor="middle" fill="white" font-size="11" font-family="sans-serif">RECOVERY</text>
            </svg>`],medical:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8f5e9"/>
                <rect x="130" y="30" width="140" height="100" fill="#fff" stroke="#e53935" stroke-width="4"/>
                <rect x="180" y="45" width="40" height="70" fill="#e53935"/>
                <rect x="145" y="65" width="110" height="40" fill="#e53935"/>
                <rect x="0" y="130" width="120" height="50" fill="#8d6e63"/>
                <rect x="280" y="130" width="120" height="50" fill="#8d6e63"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <rect x="50" y="15" width="300" height="140" fill="#fff" stroke="#1976d2" stroke-width="4"/>
                <rect x="70" y="35" width="110" height="50" fill="#bbdefb"/><rect x="220" y="35" width="110" height="50" fill="#bbdefb"/>
                <rect x="120" y="100" width="160" height="45" fill="#90caf9"/>
                <circle cx="200" cy="122" r="16" fill="#e53935"/><rect x="193" y="108" width="14" height="28" fill="#fff"/>
                <rect x="188" y="115" width="24" height="14" fill="#fff"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e1f5fe"/>
                <rect x="0" y="10" width="400" height="145" fill="#fff" stroke="#0288d1" stroke-width="4"/>
                <rect x="15" y="30" width="115" height="60" fill="#b3e5fc"/>
                <rect x="145" y="30" width="115" height="60" fill="#81d4fa"/>
                <rect x="275" y="30" width="110" height="60" fill="#4fc3f7"/>
                <rect x="80" y="105" width="240" height="45" fill="#0288d1"/>
                <text x="200" y="135" text-anchor="middle" fill="white" font-size="14" font-weight="bold">FYSIOTHERAPIE</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8eaf6"/>
                <rect x="0" y="0" width="400" height="180" fill="#fff" stroke="#303f9f" stroke-width="4"/>
                <rect x="10" y="15" width="120" height="70" fill="#c5cae9"/><rect x="140" y="15" width="120" height="70" fill="#9fa8da"/>
                <rect x="270" y="15" width="120" height="70" fill="#7986cb"/>
                <rect x="10" y="95" width="190" height="75" fill="#3f51b5"/>
                <text x="105" y="140" text-anchor="middle" fill="white" font-size="13" font-weight="bold">MRI SCANNER</text>
                <rect x="200" y="95" width="190" height="75" fill="#1a237e"/>
                <text x="295" y="140" text-anchor="middle" fill="white" font-size="13" font-weight="bold">OPERATIEKAMER</text>
            </svg>`],academy:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#c8e6c9"/>
                <rect x="0" y="90" width="400" height="90" fill="#8bc34a"/>
                <circle cx="100" cy="65" r="25" fill="#ffcc80"/><circle cx="200" cy="60" r="22" fill="#ffcc80"/><circle cx="300" cy="65" r="25" fill="#ffcc80"/>
                <rect x="88" y="80" width="24" height="50" fill="#1976d2"/><rect x="188" y="78" width="24" height="52" fill="#388e3c"/><rect x="288" y="80" width="24" height="50" fill="#d32f2f"/>
                <circle cx="200" cy="140" r="20" fill="#fff" stroke="#333" stroke-width="3"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#a5d6a7"/>
                <rect x="0" y="70" width="400" height="110" fill="#66bb6a"/>
                <rect x="20" y="10" width="160" height="60" fill="#5d4037"/>
                <rect x="220" y="10" width="160" height="60" fill="#5d4037"/>
                <circle cx="60" cy="95" r="18" fill="#ffcc80"/><circle cx="130" cy="90" r="16" fill="#ffcc80"/><circle cx="200" cy="95" r="18" fill="#ffcc80"/>
                <circle cx="270" cy="90" r="16" fill="#ffcc80"/><circle cx="340" cy="95" r="18" fill="#ffcc80"/>
                <rect x="50" y="108" width="20" height="35" fill="#1976d2"/><rect x="120" y="105" width="20" height="35" fill="#1976d2"/>
                <rect x="190" y="108" width="20" height="35" fill="#1976d2"/><rect x="260" y="105" width="20" height="35" fill="#1976d2"/>
                <rect x="330" y="108" width="20" height="35" fill="#1976d2"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#81c784"/>
                <rect x="0" y="50" width="195" height="130" fill="#4caf50" stroke="#fff" stroke-width="3"/>
                <rect x="205" y="50" width="195" height="130" fill="#388e3c" stroke="#fff" stroke-width="3"/>
                <rect x="100" y="5" width="200" height="45" fill="#5d4037"/>
                <text x="200" y="35" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">VOETBALSCHOOL</text>
                <circle cx="50" cy="100" r="16" fill="#ffcc80"/><circle cx="100" cy="95" r="14" fill="#ffcc80"/>
                <circle cx="150" cy="100" r="16" fill="#ffcc80"/>
                <circle cx="250" cy="100" r="16" fill="#ffcc80"/><circle cx="300" cy="95" r="14" fill="#ffcc80"/>
                <circle cx="350" cy="100" r="16" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#4caf50"/>
                <rect x="0" y="40" width="400" height="140" fill="#2e7d32" stroke="#ffd700" stroke-width="4"/>
                <rect x="120" y="0" width="160" height="42" fill="#ffd700"/>
                <text x="200" y="28" text-anchor="middle" fill="#333" font-size="16" font-weight="bold">TOPACADEMIE</text>
                <circle cx="50" cy="100" r="20" fill="#ffcc80"/><circle cx="120" cy="95" r="17" fill="#ffcc80"/>
                <circle cx="190" cy="100" r="20" fill="#ffcc80"/><circle cx="260" cy="100" r="20" fill="#ffcc80"/>
                <circle cx="330" cy="95" r="17" fill="#ffcc80"/><circle cx="390" cy="100" r="20" fill="#ffcc80"/>
                <text x="50" y="145" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
                <text x="200" y="145" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
                <text x="350" y="145" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
            </svg>`],scouting:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8f5e9"/>
                <circle cx="200" cy="90" r="70" fill="#c8e6c9" stroke="#4caf50" stroke-width="4"/>
                <circle cx="200" cy="90" r="50" fill="#a5d6a7"/>
                <circle cx="200" cy="90" r="30" fill="#81c784"/>
                <circle cx="200" cy="90" r="8" fill="#4caf50"/>
                <circle cx="170" cy="70" r="10" fill="#ffcc80"/><circle cx="230" cy="105" r="8" fill="#ffcc80"/>
                <circle cx="120" cy="100" r="6" fill="#ffcc80"/><circle cx="280" cy="80" r="7" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <ellipse cx="200" cy="90" rx="190" ry="80" fill="#bbdefb" stroke="#1976d2" stroke-width="3"/>
                <ellipse cx="200" cy="90" rx="130" ry="55" fill="#90caf9"/>
                <ellipse cx="200" cy="90" rx="70" ry="30" fill="#64b5f6"/>
                <circle cx="80" cy="70" r="10" fill="#ffcc80"/><circle cx="200" cy="50" r="8" fill="#ffcc80"/>
                <circle cx="320" cy="80" r="9" fill="#ffcc80"/><circle cx="140" cy="120" r="7" fill="#ffcc80"/>
                <circle cx="260" cy="115" r="8" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff3e0"/>
                <ellipse cx="200" cy="90" rx="200" ry="85" fill="#ffe0b2" stroke="#ff9800" stroke-width="3"/>
                <path d="M50 90 Q200 20 350 90 Q200 160 50 90" fill="#ffcc80"/>
                <circle cx="60" cy="90" r="8" fill="#d32f2f"/><circle cx="130" cy="55" r="7" fill="#1976d2"/>
                <circle cx="200" cy="40" r="9" fill="#388e3c"/><circle cx="270" cy="60" r="7" fill="#7b1fa2"/>
                <circle cx="340" cy="90" r="8" fill="#ff9800"/><circle cx="270" cy="125" r="7" fill="#00796b"/>
                <circle cx="130" cy="130" r="8" fill="#c2185b"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#1a237e"/>
                <circle cx="200" cy="90" r="75" fill="#3f51b5"/>
                <ellipse cx="200" cy="90" rx="100" ry="45" fill="none" stroke="#7986cb" stroke-width="2"/>
                <ellipse cx="200" cy="90" rx="140" ry="65" fill="none" stroke="#9fa8da" stroke-width="2"/>
                <ellipse cx="200" cy="90" rx="180" ry="80" fill="none" stroke="#c5cae9" stroke-width="2"/>
                <circle cx="50" cy="50" r="5" fill="#ffeb3b"/><circle cx="100" cy="140" r="4" fill="#ffeb3b"/>
                <circle cx="200" cy="25" r="6" fill="#ffeb3b"/><circle cx="300" cy="60" r="5" fill="#ffeb3b"/>
                <circle cx="350" cy="120" r="4" fill="#ffeb3b"/><circle cx="140" cy="35" r="4" fill="#ffeb3b"/>
                <circle cx="260" cy="155" r="5" fill="#ffeb3b"/>
                <rect x="360" y="10" width="35" height="25" fill="#78909c"/>
                <rect x="367" y="0" width="6" height="12" fill="#90a4ae"/><rect x="382" y="0" width="6" height="12" fill="#90a4ae"/>
            </svg>`],youthscouting:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#f3e5f5"/>
                <rect x="0" y="30" width="400" height="120" fill="#e1bee7" stroke="#9c27b0" stroke-width="3"/>
                <circle cx="100" cy="80" r="25" fill="#ffcc80"/><circle cx="200" cy="75" r="20" fill="#ffcc80"/><circle cx="300" cy="80" r="23" fill="#ffcc80"/>
                <rect x="90" y="100" width="20" height="35" fill="#7b1fa2"/><rect x="190" y="95" width="20" height="35" fill="#7b1fa2"/>
                <rect x="290" y="100" width="20" height="35" fill="#7b1fa2"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8eaf6"/>
                <rect x="0" y="25" width="400" height="130" fill="#c5cae9" stroke="#3f51b5" stroke-width="3"/>
                <circle cx="50" cy="80" r="22" fill="#ffcc80"/><circle cx="130" cy="75" r="19" fill="#ffcc80"/>
                <circle cx="210" cy="80" r="22" fill="#ffcc80"/><circle cx="290" cy="75" r="19" fill="#ffcc80"/>
                <circle cx="370" cy="80" r="22" fill="#ffcc80"/>
                <text x="50" y="130" text-anchor="middle" fill="#3f51b5" font-size="18">⭐</text>
                <text x="210" y="130" text-anchor="middle" fill="#3f51b5" font-size="18">⭐</text>
                <text x="370" y="130" text-anchor="middle" fill="#3f51b5" font-size="18">⭐</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e0f7fa"/>
                <rect x="0" y="20" width="400" height="140" fill="#b2ebf2" stroke="#00acc1" stroke-width="4"/>
                <rect x="120" y="0" width="160" height="28" fill="#00838f"/>
                <text x="200" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">SCOUTRAPPORT</text>
                <circle cx="60" cy="75" r="25" fill="#ffcc80"/><circle cx="160" cy="70" r="22" fill="#ffcc80"/>
                <circle cx="260" cy="75" r="25" fill="#ffcc80"/><circle cx="360" cy="70" r="22" fill="#ffcc80"/>
                <text x="60" y="125" text-anchor="middle" fill="#00838f" font-size="16" font-weight="bold">A</text>
                <text x="160" y="125" text-anchor="middle" fill="#00838f" font-size="16" font-weight="bold">B+</text>
                <text x="260" y="125" text-anchor="middle" fill="#ffd700" font-size="20">★</text>
                <text x="360" y="125" text-anchor="middle" fill="#00838f" font-size="16" font-weight="bold">A-</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff8e1"/>
                <rect x="0" y="10" width="400" height="160" fill="#ffecb3" stroke="#ffa000" stroke-width="4"/>
                <polygon points="200,20 215,55 255,55 223,80 235,120 200,95 165,120 177,80 145,55 185,55" fill="#ffd700"/>
                <circle cx="50" cy="95" r="28" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <circle cx="140" cy="90" r="25" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <circle cx="260" cy="90" r="25" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <circle cx="350" cy="95" r="28" fill="#ffcc80" stroke="#ffa000" stroke-width="3"/>
                <text x="50" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
                <text x="140" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
                <text x="260" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
                <text x="350" y="145" text-anchor="middle" fill="#ff6f00" font-size="18">★</text>
            </svg>`],kantine:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#efebe9"/>
                <rect x="50" y="40" width="300" height="120" fill="#8d6e63" stroke="#5d4037" stroke-width="4"/>
                <rect x="160" y="90" width="80" height="70" fill="#5d4037"/>
                <rect x="80" y="60" width="50" height="55" fill="#a1887f"/>
                <rect x="270" y="60" width="50" height="55" fill="#a1887f"/>
                <ellipse cx="200" cy="30" rx="45" ry="22" fill="#795548"/>
                <text x="200" y="38" text-anchor="middle" fill="white" font-size="16">☕</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff3e0"/>
                <rect x="0" y="35" width="400" height="130" fill="#ffcc80" stroke="#ff9800" stroke-width="4"/>
                <rect x="20" y="55" width="130" height="70" fill="#ffe0b2"/>
                <rect x="250" y="55" width="130" height="70" fill="#ffe0b2"/>
                <rect x="140" y="130" width="120" height="50" fill="#5d4037"/>
                <ellipse cx="85" cy="30" rx="30" ry="18" fill="#ff9800"/>
                <text x="85" y="38" text-anchor="middle" fill="white" font-size="14">🍺</text>
                <ellipse cx="315" cy="30" rx="30" ry="18" fill="#ff9800"/>
                <text x="315" y="38" text-anchor="middle" fill="white" font-size="14">🍺</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fce4ec"/>
                <rect x="0" y="25" width="400" height="140" fill="#f8bbd9" stroke="#e91e63" stroke-width="4"/>
                <rect x="15" y="45" width="110" height="60" fill="#fff"/>
                <rect x="145" y="45" width="110" height="60" fill="#fff"/>
                <rect x="275" y="45" width="110" height="60" fill="#fff"/>
                <rect x="80" y="120" width="240" height="50" fill="#c2185b"/>
                <text x="200" y="152" text-anchor="middle" fill="white" font-size="16" font-weight="bold">KEUKEN</text>
                <circle cx="70" cy="75" r="20" fill="#ffcc80"/><circle cx="200" cy="75" r="20" fill="#ffcc80"/>
                <circle cx="330" cy="75" r="20" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8eaf6"/>
                <rect x="0" y="15" width="400" height="150" fill="#c5cae9" stroke="#3f51b5" stroke-width="5"/>
                <rect x="10" y="25" width="125" height="65" fill="#fff"/><rect x="145" y="25" width="125" height="65" fill="#fff"/>
                <rect x="280" y="25" width="110" height="65" fill="#fff"/>
                <rect x="10" y="100" width="195" height="60" fill="#1a237e"/>
                <text x="107" y="138" text-anchor="middle" fill="#ffd700" font-size="14" font-weight="bold">⭐ VIP LOUNGE ⭐</text>
                <rect x="210" y="100" width="180" height="60" fill="#283593"/>
                <text x="300" y="138" text-anchor="middle" fill="white" font-size="14" font-weight="bold">SKYBOX</text>
            </svg>`],sponsoring:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#f5f5f5"/>
                <rect x="50" y="30" width="300" height="120" fill="#fff" stroke="#9e9e9e" stroke-width="3"/>
                <rect x="80" y="55" width="240" height="70" fill="#e0e0e0"/>
                <text x="200" y="98" text-anchor="middle" fill="#616161" font-size="16" font-weight="bold">LOKALE SPONSOR</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <rect x="10" y="25" width="185" height="90" fill="#fff" stroke="#1976d2" stroke-width="3"/>
                <rect x="205" y="25" width="185" height="90" fill="#fff" stroke="#1976d2" stroke-width="3"/>
                <text x="102" y="78" text-anchor="middle" fill="#1976d2" font-size="14" font-weight="bold">SPONSOR A</text>
                <text x="297" y="78" text-anchor="middle" fill="#1976d2" font-size="14" font-weight="bold">SPONSOR B</text>
                <rect x="100" y="125" width="200" height="50" fill="#1565c0"/>
                <text x="200" y="158" text-anchor="middle" fill="white" font-size="14" font-weight="bold">🤝 PARTNERSHIP</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e8f5e9"/>
                <rect x="5" y="15" width="125" height="80" fill="#fff" stroke="#388e3c" stroke-width="3"/>
                <rect x="140" y="15" width="125" height="80" fill="#fff" stroke="#388e3c" stroke-width="3"/>
                <rect x="275" y="15" width="120" height="80" fill="#fff" stroke="#388e3c" stroke-width="3"/>
                <text x="67" y="60" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">PREMIUM</text>
                <text x="202" y="60" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">PREMIUM</text>
                <text x="335" y="60" text-anchor="middle" fill="#2e7d32" font-size="12" font-weight="bold">PREMIUM</text>
                <rect x="50" y="105" width="300" height="65" fill="#1b5e20"/>
                <text x="200" y="145" text-anchor="middle" fill="white" font-size="16" font-weight="bold">💼 GROTE SPONSORS</text>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fff8e1"/>
                <rect x="0" y="10" width="400" height="160" fill="#ffecb3" stroke="#ffa000" stroke-width="4"/>
                <polygon points="200,20 218,65 270,65 228,95 245,145 200,115 155,145 172,95 130,65 182,65" fill="#ffd700"/>
                <rect x="10" y="40" width="100" height="60" fill="#fff" stroke="#ff8f00" stroke-width="3"/>
                <rect x="290" y="40" width="100" height="60" fill="#fff" stroke="#ff8f00" stroke-width="3"/>
                <text x="60" y="78" text-anchor="middle" fill="#ff6f00" font-size="12" font-weight="bold">PLATINUM</text>
                <text x="340" y="78" text-anchor="middle" fill="#ff6f00" font-size="12" font-weight="bold">PLATINUM</text>
            </svg>`],perszaal:[`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#eceff1"/>
                <rect x="50" y="35" width="300" height="120" fill="#cfd8dc" stroke="#607d8b" stroke-width="3"/>
                <rect x="150" y="55" width="100" height="55" fill="#455a64"/>
                <circle cx="200" cy="82" r="15" fill="#263238"/>
                <rect x="100" y="120" width="200" height="30" fill="#78909c"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e0e0e0"/>
                <rect x="0" y="25" width="400" height="130" fill="#bdbdbd" stroke="#757575" stroke-width="4"/>
                <rect x="130" y="35" width="140" height="70" fill="#424242"/>
                <circle cx="200" cy="70" r="20" fill="#212121"/>
                <rect x="30" y="115" width="90" height="35" fill="#616161"/>
                <rect x="155" y="115" width="90" height="35" fill="#616161"/>
                <rect x="280" y="115" width="90" height="35" fill="#616161"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#e3f2fd"/>
                <rect x="0" y="15" width="400" height="150" fill="#bbdefb" stroke="#1976d2" stroke-width="4"/>
                <rect x="100" y="25" width="200" height="90" fill="#0d47a1"/>
                <rect x="115" y="38" width="170" height="65" fill="#1565c0"/>
                <text x="200" y="80" text-anchor="middle" fill="white" font-size="18" font-weight="bold">📺 LIVE</text>
                <circle cx="40" cy="135" r="20" fill="#ffcc80"/><circle cx="100" cy="135" r="20" fill="#ffcc80"/>
                <circle cx="300" cy="135" r="20" fill="#ffcc80"/><circle cx="360" cy="135" r="20" fill="#ffcc80"/>
            </svg>`,`<svg viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="400" height="180" fill="#fce4ec"/>
                <rect x="0" y="10" width="400" height="160" fill="#f8bbd9" stroke="#c2185b" stroke-width="5"/>
                <rect x="90" y="20" width="220" height="100" fill="#880e4f"/>
                <rect x="105" y="32" width="190" height="76" fill="#ad1457"/>
                <text x="200" y="80" text-anchor="middle" fill="white" font-size="20" font-weight="bold">🎬 STUDIO</text>
                <rect x="15" y="130" width="110" height="40" fill="#6a1b9a"/>
                <rect x="145" y="130" width="110" height="40" fill="#4a148c"/>
                <rect x="275" y="130" width="110" height="40" fill="#6a1b9a"/>
            </svg>`]}[e];return i?i[t]||i[i.length-1]:""}function Ot(e){const t=W[e];if(!t)return;const n={tribune:"🏟️",grass:"🌱",training:"💪",medical:"🏥",academy:"🎓",scouting:"🔍",youthscouting:"👶",kantine:"🍺",sponsoring:"💼",perszaal:"📰"},i={tribune:"Stadion",grass:"Wedstrijdveld",training:"Trainingsveld",medical:"Medische Voorzieningen",academy:"Jeugdopleiding",scouting:"Scouting",youthscouting:"Jeugdscouting",kantine:"Kantine",sponsoring:"Sponsoring",perszaal:"Perszaal"};o.stadium.youthscouting||(o.stadium.youthscouting="ysct_1");const a=o.stadium[t.stateKey],s=t.levels.findIndex(G=>G.id===a),r=t.levels[s]||t.levels[0],l=t.levels[s+1],c=!l,d=t.levels.length,u=W.tribune.levels.find(G=>G.id===o.stadium.tribune)?.capacity||200,f=l?.reqCapacity&&u<l.reqCapacity,m=document.getElementById("detail-icon"),p=document.getElementById("detail-title"),h=document.getElementById("detail-level"),g=document.getElementById("detail-level-name"),x=document.getElementById("detail-description"),k=document.getElementById("detail-current-effect"),v=document.getElementById("detail-next-effect"),$=document.getElementById("detail-next-name"),M=document.getElementById("detail-improvement"),A=document.getElementById("detail-levels-track"),T=document.getElementById("detail-next-upgrade"),j=document.getElementById("detail-cost"),N=document.getElementById("detail-requirement"),z=document.getElementById("detail-req-text"),_=document.getElementById("btn-upgrade-stadium");m&&(m.textContent=n[e]||"🏟️"),p&&(p.textContent=i[e]||e),h&&(h.textContent=`Niveau ${s+1} van ${d}`),g&&(g.textContent=r.name||""),x&&(x.textContent=t.description||""),k&&(k.innerHTML=`<span class="benefit-main">${r.effect}</span>`);const de=document.getElementById("detail-illustration");if(de&&(de.innerHTML=as(e,s)),A){let G="";t.levels.forEach((ae,Se)=>{let ue="level-step";Se<s?ue+=" completed":Se===s?ue+=" current":ue+=" locked";const Ht=ae.name.split(" ")[0];G+=`
                <div class="${ue}">
                    <div class="level-dot">${Se+1}</div>
                    <span class="level-name-short">${Ht}</span>
                </div>
            `}),A.innerHTML=G}if(c)T&&(T.classList.add("maxed"),T.innerHTML=`
                <div class="next-upgrade-header">
                    <span class="next-label">Status</span>
                    <span class="next-name">✅ Maximaal niveau</span>
                </div>
                <div class="next-upgrade-content">
                    <div class="next-benefit">
                        <span class="next-benefit-icon">🏆</span>
                        <span class="next-benefit-text">Alle upgrades voltooid!</span>
                    </div>
                </div>
            `),j&&(j.textContent="—"),N&&(N.style.display="none"),_&&(_.disabled=!0,_.innerHTML='<span class="btn-icon">✅</span><span class="btn-text">Maximaal</span>');else{const G=o.club.budget>=l.cost;if(T&&T.classList.remove("maxed"),$&&($.textContent=l.name),v&&(v.textContent=l.effect),M){const ae=ss(e,r,l);ae?(M.style.display="flex",M.innerHTML=`
                    <span class="improvement-badge">${ae.badge}</span>
                    <span class="improvement-text">${ae.text}</span>
                `):M.style.display="none"}j&&(j.textContent=b(l.cost)),N&&(f?(N.style.display="flex",z&&(z.textContent=`Vereist: Stadion met ${l.reqCapacity}+ capaciteit`)):N.style.display="none"),_&&(f?(_.disabled=!0,_.innerHTML='<span class="btn-icon">🔒</span><span class="btn-text">Stadion te klein</span>'):G?(_.disabled=!1,_.innerHTML='<span class="btn-icon">🔨</span><span class="btn-text">Bouwen</span>'):(_.disabled=!0,_.innerHTML='<span class="btn-icon">💸</span><span class="btn-text">Te duur</span>'))}}function ss(e,t,n){const i=t.effect.match(/(\d+)/),a=n.effect.match(/(\d+)/);if(i&&a){const r=parseInt(i[1]),l=parseInt(a[1]);if(r>0){const c=Math.round((l-r)/r*100);if(c>0)return{badge:`+${c}%`,text:"verbetering"}}else if(l>0)return{badge:`+${l}`,text:"nieuw"}}return{tribune:{badge:"⬆️",text:"meer capaciteit"},grass:{badge:"⬆️",text:"beter thuisvoordeel"},training:{badge:"⬆️",text:"snellere groei"},medical:{badge:"⬆️",text:"sneller herstel"},academy:{badge:"⬆️",text:"beter talent"},scouting:{badge:"⬆️",text:"groter bereik"},youthscouting:{badge:"⬆️",text:"beter jeugdtalent"},kantine:{badge:"⬆️",text:"meer inkomsten"}}[e]||null}function os(){const e=qt,t=W[e];if(!t)return;const n=o.stadium[t.stateKey],i=t.levels.findIndex(s=>s.id===n),a=t.levels[i+1];if(!a){E("Maximaal niveau bereikt!","info");return}if(o.club.budget<a.cost){E("Niet genoeg budget!","error");return}if(a.reqCapacity&&(W.tribune.levels.find(r=>r.id===o.stadium.tribune)?.capacity||200)<a.reqCapacity){E(`Stadion te klein! Vereist ${a.reqCapacity}+ capaciteit.`,"error");return}o.club.budget-=a.cost,o.stadium[t.stateKey]=a.id,e==="tribune"&&a.capacity&&(o.stadium.capacity=a.capacity),zt(),Ot(e),P(),E(`${a.name} gebouwd!`,"success"),F()}function zt(){Object.entries(W).forEach(([t,n])=>{const i=o.stadium[n.stateKey],a=n.levels.findIndex(r=>r.id===i),s=document.getElementById(`cat-${t}-level`);s&&(s.textContent=`Nv.${a+1}`)});const e=document.getElementById("stadium-capacity");e&&(e.textContent=o.stadium.capacity||200)}function rs(){zt(),_t("tribune")}window.selectStadiumCategory=_t;window.upgradeStadiumCategory=os;function ls(){cs(),ds(),us(),fs(),ms(),ps()}function cs(){const e=document.getElementById("km-manager-name"),t=document.getElementById("km-club-name");e&&(e.textContent=o.managerName||"Trainer"),t&&(t.textContent=o.clubName||"FC Goals Maken")}function ds(){const e=document.getElementById("km-home"),t=document.getElementById("km-away"),n=document.getElementById("km-league"),i=document.getElementById("km-match-date");e&&(e.textContent=o.clubName||"FC Goals Maken");const s=(o.schedule||[]).find(r=>!r.played);if(s&&t){const r=s.homeTeam===o.clubName;t.textContent=r?s.awayTeam:s.homeTeam}if(n){const r=o.division||8;n.textContent=`${r}e Klasse`}if(i){const r=document.getElementById("timer-hours")?.textContent||"00",l=document.getElementById("timer-minutes")?.textContent||"00";i.textContent=`Over ${r}u ${l}m`,setInterval(()=>{const c=document.getElementById("timer-hours")?.textContent||"00",d=document.getElementById("timer-minutes")?.textContent||"00";i.textContent=`Over ${c}u ${d}m`},6e4)}}function us(){const e=document.getElementById("km-played"),t=document.getElementById("km-wins"),n=document.getElementById("km-draws"),i=document.getElementById("km-losses"),a=o.seasonStats||{wins:0,draws:0,losses:0},s=(a.wins||0)+(a.draws||0)+(a.losses||0);e&&(e.textContent=s),t&&(t.textContent=a.wins||0),n&&(n.textContent=a.draws||0),i&&(i.textContent=a.losses||0)}function fs(){const e=document.getElementById("km-standings-body");if(!e)return;const t=o.standings||[],n=o.clubName||"FC Goals Maken";let i="";t.forEach((a,s)=>{const r=a.name===n,l=s<2,c=s>=t.length-2;i+=`<tr class="${r?"is-player":""} ${l?"promo":""} ${c?"relegation":""}">
            <td>${s+1}</td>
            <td>${a.name}</td>
            <td>${a.wins||0}</td>
            <td>${a.draws||0}</td>
            <td>${a.losses||0}</td>
            <td>${a.points}</td>
        </tr>`}),e.innerHTML=i}function ms(){const e=document.getElementById("km-possession"),t=document.getElementById("km-budget"),n=document.getElementById("km-rating"),i=document.getElementById("km-goals"),a=o.avgPossession||50;if(e){e.textContent=`${Math.round(a)}%`;const s=e.closest(".km-circle");s&&s.style.setProperty("--progress",a)}if(t){const s=o.budget||5e3;t.textContent=`€${s.toLocaleString("nl-NL")}`}if(n){const s=o.players||[],r=s.length>0?Math.round(s.reduce((l,c)=>l+(c.overall||40),0)/s.length):40;n.textContent=r}if(i){const s=(o.players||[]).reduce((r,l)=>r+(l.seasonGoals||0),0);i.textContent=s}}function ps(){const e=document.getElementById("km-starplayers");if(!e)return;const t=(o.players||[]).filter(n=>!n.isYouth).sort((n,i)=>i.overall-n.overall).slice(0,3);if(t.length===0){e.innerHTML='<p style="color: #94a3b8; text-align: center; padding: 20px;">Geen spelers in selectie</p>';return}e.innerHTML=t.map(n=>{const i=S[n.position]||{name:"Speler"};return`
            <div class="km-star-player">
                <div class="km-star-avatar">${n.nationality?.flag||"🇳🇱"}</div>
                <div class="km-star-info">
                    <p class="km-star-name">${n.name}</p>
                    <span class="km-star-pos">${i.name} · ${n.age} jaar</span>
                </div>
                <span class="km-star-rating">${n.overall}</span>
            </div>
        `}).join("")}document.addEventListener("DOMContentLoaded",()=>{pa()});console.log("🎮 Zaterdagvoetbal loaded via Vite!");
