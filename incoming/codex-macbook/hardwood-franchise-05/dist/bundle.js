(function(){
"use strict";
// ===== util.js =====
const U = {
  ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; },
  rf(a, b) { return Math.random() * (b - a) + a; },
  chance(p) { return Math.random() < p; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  wpick(arr, wfn) {
    let tot = 0; const ws = arr.map(x => { const w = Math.max(0, wfn(x)); tot += w; return w; });
    if (tot <= 0) return arr[Math.floor(Math.random() * arr.length)];
    let r = Math.random() * tot;
    for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  },
  gauss(mean = 0, sd = 1) {
    let u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  },
  clamp(x, a, b) { return x < a ? a : x > b ? b : x; },
  shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; },
  sum(arr, f) { let s = 0; for (const x of arr) s += f ? f(x) : x; return s; },
  avg(arr, f) { return arr.length ? U.sum(arr, f) / arr.length : 0; },
  maxBy(arr, f) { let best = null, bv = -Infinity; for (const x of arr) { const v = f(x); if (v > bv) { bv = v; best = x; } } return best; },
  sortBy(arr, f, desc = true) { return arr.slice().sort((a, b) => desc ? f(b) - f(a) : f(a) - f(b)); },
  money(k, dec) { // k = thousands of dollars
    const neg = k < 0; k = Math.abs(k);
    let s;
    if (k >= 1000) s = '$' + (k / 1000).toFixed(dec != null ? dec : (k >= 100000 ? 0 : 1)) + 'M';
    else s = k === 0 ? '$0' : '$' + Math.round(k) + 'K';
    return neg ? '-' + s : s;
  },
  dollars(n) { return '$' + Math.round(n).toLocaleString('en-US'); },
  pct(x, d = 1) { return (x * 100).toFixed(d) + '%'; },
  fg(m, a) { return a ? (m / a).toFixed(3).replace(/^0/, '') : '.000'; },
  f1(x) { return (Math.round(x * 10) / 10).toFixed(1); },
  esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
  ord(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); },
  hgt(inches) { return Math.floor(inches / 12) + "'" + (inches % 12) + '"'; },
  seasonLabel(y) { return y + '-' + String((y + 1) % 100).padStart(2, '0'); },
  fill(tpl, o) { return tpl.replace(/\{(\w+)\}/g, (m, k) => o[k] != null ? o[k] : m); },
  grade(score) { // 0-100 → letter
    if (score >= 93) return 'A+'; if (score >= 86) return 'A'; if (score >= 80) return 'A-';
    if (score >= 75) return 'B+'; if (score >= 70) return 'B'; if (score >= 65) return 'B-';
    if (score >= 60) return 'C+'; if (score >= 55) return 'C'; if (score >= 50) return 'C-';
    if (score >= 42) return 'D'; return 'F';
  },
};

// ===== data.js =====
const LEAGUE = { name: 'United Basketball League', abbr: 'UBL' };
const CONFS = ['East', 'West'];
const DIVS = ['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest'];

// abbr, region, name, div, metro pop (millions), colors
const TEAM_DEFS = [
  ['NYE', 'New York', 'Empire', 0, 18.7, '#4b2a8f', '#c3c9d4'],
  ['BOS', 'Boston', 'Harriers', 0, 4.4, '#0a6e5c', '#f1e3c3'],
  ['PHI', 'Philadelphia', 'Founders', 0, 5.8, '#8a1c3b', '#7f9cc9'],
  ['BAL', 'Baltimore', 'Tide', 0, 2.6, '#00838f', '#f2c14e'],
  ['HFD', 'Hartford', 'Foxes', 0, 1.2, '#d9480f', '#9aa5b1'],
  ['CHI', 'Chicago', 'Blaze', 1, 9.4, '#ff5a1f', '#ffd166'],
  ['DET', 'Detroit', 'Engines', 1, 4.5, '#3d5a80', '#e0e1dd'],
  ['CLE', 'Cleveland', 'Ironclads', 1, 2.1, '#a0441f', '#9fb3c8'],
  ['IND', 'Indianapolis', 'Racers', 1, 1.6, '#e0b100', '#3a3a3a'],
  ['MIL', 'Milwaukee', 'Muskies', 1, 1.5, '#2d6a4f', '#90e0ef'],
  ['MIA', 'Miami', 'Riptide', 2, 5.4, '#ff4d8d', '#00b4d8'],
  ['ATL', 'Atlanta', 'Firebirds', 2, 4.9, '#c1272d', '#f7b32b'],
  ['CHA', 'Charlotte', 'Monarchs', 2, 1.5, '#6a2c9e', '#2ec4b6'],
  ['ORL', 'Orlando', 'Comets', 2, 1.9, '#1f7aff', '#b8c4d6'],
  ['WAS', 'Washington', 'Sentinels', 2, 5.2, '#2b3a67', '#e63946'],
  ['SEA', 'Seattle', 'Squall', 3, 3.2, '#2f7d5b', '#48cae4'],
  ['POR', 'Portland', 'Lumberjacks', 3, 2.1, '#b5121b', '#e9d8a6'],
  ['DEN', 'Denver', 'Summit', 3, 2.4, '#1e6091', '#ffc300'],
  ['SLC', 'Salt Lake', 'Peaks', 3, 1.1, '#7b1e2b', '#caf0f8'],
  ['MIN', 'Minneapolis', 'Loons', 3, 3.1, '#1f4e5f', '#8bd3c7'],
  ['LA', 'Los Angeles', 'Waves', 4, 12.9, '#ffb703', '#1d5fbf'],
  ['SF', 'San Francisco', 'Fog', 4, 4.2, '#fb8500', '#adb5bd'],
  ['LV', 'Las Vegas', 'High Rollers', 4, 1.7, '#d4af37', '#c1121f'],
  ['SD', 'San Diego', 'Surf', 4, 2.9, '#2a9d8f', '#e9c46a'],
  ['PHX', 'Phoenix', 'Scorpions', 4, 3.9, '#e85d04', '#7b2cbf'],
  ['DAL', 'Dallas', 'Outlaws', 5, 5.8, '#8d99ae', '#2b4c7e'],
  ['HOU', 'Houston', 'Wildcatters', 5, 5.3, '#ae2012', '#ee9b00'],
  ['SA', 'San Antonio', 'Vaqueros', 5, 1.9, '#0096c7', '#d4622a'],
  ['NO', 'New Orleans', 'Krewe', 5, 1.3, '#7b3fc4', '#3cb371'],
  ['MEM', 'Memphis', 'Soul', 5, 1.3, '#4361ee', '#4cc9f0'],
];

const RELO_CITIES = [
  ['Kansas City', 2.0], ['St. Louis', 2.8], ['Pittsburgh', 2.4], ['Nashville', 1.4], ['Louisville', 1.2],
  ['Columbus', 1.7], ['Cincinnati', 2.1], ['Austin', 1.4], ['Tampa Bay', 2.6], ['Vancouver', 2.1],
  ['Toronto', 5.3], ['Mexico City', 19.0], ['Omaha', 0.8], ['Albuquerque', 0.8], ['Oklahoma City', 1.1],
  ['Buffalo', 1.2], ['Honolulu', 0.9], ['Anchorage', 0.4], ['Virginia Beach', 1.6], ['Raleigh', 1.3],
  ['Sacramento', 2.0], ['Birmingham', 1.1], ['Richmond', 1.1], ['Jacksonville', 1.2], ['Providence', 1.6],
  ['Des Moines', 0.5], ['Boise', 0.6], ['Spokane', 0.5], ['Tucson', 0.9], ['El Paso', 0.7],
  ['Montreal', 3.6], ['Brooklyn', 2.5], ['Newark', 2.1], ['San Jose', 1.8], ['Orange County', 3.0],
];

const NICK_IDEAS = ['Barons', 'Express', 'Thunderbolts', 'Monarchs', 'Rhythm', 'Stampede', 'Cyclones', 'Aviators', 'Mustangs', 'Bombers',
  'Generals', 'Pilots', 'Royals', 'Hurricanes', 'Wolves', 'Voltage', 'Tempest', 'Ravens', 'Gold', 'Ice', 'Heat Wave', 'Crusaders',
  'Admirals', 'Coyotes', 'Rockets', 'Rush', 'Flight', 'Kings', 'Bulldogs', 'Twisters'];

const FIRST = ['James', 'Marcus', 'Andre', 'Tyrone', 'Darnell', 'Kevin', 'Chris', 'Michael', 'Anthony', 'Brandon', 'Jason', 'Derrick', 'Terrence',
  'Jamal', 'Corey', 'Eric', 'Antoine', 'Reggie', 'Lamar', 'DeShawn', 'Malik', 'Rashad', 'Travis', 'Jerome', 'Darius', 'Kendrick', 'Isaiah',
  'Elijah', 'Josh', 'Ryan', 'Tyler', 'Kyle', 'Matt', 'Brian', 'Greg', 'Tony', 'Willie', 'Earl', 'Cedric', 'Maurice', 'Quentin', 'Rodney',
  'Shawn', 'Damon', 'Byron', 'Calvin', 'Dwayne', 'Jalen', 'Trevor', 'Devin', 'Aaron', 'Nate', 'Cliff', 'Vernon', 'Ronnie', 'Marvin', 'Carl',
  'Lonnie', 'Dominique', 'Desmond', 'Jermaine', 'Kenny', 'Luther', 'Mario', 'Omar', 'Paul', 'Raymond', 'Sam', 'Theo', 'Victor', 'Wesley',
  'Xavier', 'Zach', 'Bobby', 'Curtis', 'Dante', 'Floyd', 'Gerald', 'Harold', 'Ivan', 'Jarrett', 'Keith', 'Leon', 'Monte', 'Nick', 'Otis',
  'Percy', 'Quincy', 'Rick', 'Stacey', 'Troy', 'Vince', 'Walt', 'Alonzo', 'Bernard', 'Clarence', 'Donnell', 'Fred', 'Garrett',
  'Jordan', 'Lance', 'Mo', 'Nolan', 'Orlando', 'Preston', 'Reed', 'Stephon', 'Tremaine', 'Ulysses', 'Wendell', 'Adrian',
  'Bryce', 'Cole', 'Drew', 'Evan', 'Grant', 'Hunter', 'Jared', 'Logan', 'Mason', 'Noah', 'Owen', 'Pierce', 'Reese', 'Spencer', 'Tanner',
  'Will', 'Dexter', 'Fabian', 'Gilbert', 'Horace', 'Jamison', 'Nelson', 'Ricky', 'Shaun', 'Tracy'];
const LAST = ['Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Thomas', 'Jackson', 'White', 'Harris',
  'Martin', 'Thompson', 'Robinson', 'Clark', 'Lewis', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Hill', 'Green', 'Adams', 'Baker',
  'Nelson', 'Carter', 'Mitchell', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris',
  'Rogers', 'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey', 'Cooper', 'Richardson', 'Cox', 'Howard', 'Ward', 'Peterson', 'Gray', 'James',
  'Watson', 'Brooks', 'Kelly', 'Sanders', 'Price', 'Bennett', 'Wood', 'Barnes', 'Ross', 'Henderson', 'Coleman', 'Jenkins', 'Perry', 'Powell',
  'Long', 'Patterson', 'Hughes', 'Washington', 'Butler', 'Simmons', 'Foster', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Hayes', 'Myers',
  'Ford', 'Hamilton', 'Graham', 'Sullivan', 'Wallace', 'West', 'Cole', 'Jordan', 'Owens', 'Reynolds', 'Fisher', 'Ellis', 'Harrison', 'Gibson',
  'McDonald', 'Marshall', 'Wells', 'Tucker', 'Porter', 'Hunter', 'Hicks', 'Crawford', 'Boyd', 'Mason', 'Warren', 'Dixon', 'Burns', 'Gordon',
  'Shaw', 'Holmes', 'Rice', 'Robertson', 'Black', 'Daniels', 'Palmer', 'Mills', 'Grant', 'Knight', 'Ferguson', 'Stone', 'Hawkins', 'Dunn',
  'Perkins', 'Hudson', 'Spencer', 'Gardner', 'Stephens', 'Payne', 'Pierce', 'Berry', 'Matthews', 'Arnold', 'Wagner', 'Willis', 'Ray',
  'Watkins', 'Olson', 'Carroll', 'Duncan', 'Snyder', 'Hart', 'Cunningham', 'Bradley', 'Lane', 'Andrews', 'Ruiz', 'Harper', 'Fox', 'Riley',
  'Armstrong', 'Carpenter', 'Weaver', 'Greene', 'Lawrence', 'Elliott', 'Chavez', 'Sims', 'Austin', 'Peters', 'Kelley', 'Franklin', 'Lawson',
  'Fields', 'Ryan', 'Schmidt', 'Carr', 'Castillo', 'Wheeler', 'Chapman', 'Oliver', 'Montgomery', 'Richards', 'Williamson', 'Johnston', 'Banks',
  'Meyer', 'Bishop', 'McCoy', 'Howell', 'Morrison', 'Hansen', 'Harvey', 'Little', 'Burton', 'Stanley', 'Nguyen', 'George', 'Jacobs', 'Reid',
  'Fuller', 'Lynch', 'Dean', 'Gilbert', 'Garrett', 'Romero', 'Welch', 'Larson', 'Frazier', 'Burke', 'Hanson', 'Mendoza', 'Moreno', 'Bowman',
  'Medina', 'Fowler', 'Brewer', 'Hoffman', 'Carlson', 'Silva', 'Pearson', 'Holland', 'Douglas', 'Fleming', 'Jensen', 'Vargas', 'Byrd',
  'Davidson', 'Hopkins', 'May', 'Terry', 'Herrera', 'Wade', 'Soto', 'Walters', 'Curtis', 'Neal', 'Caldwell', 'Lowe', 'Jennings', 'Barnett',
  'Graves', 'Jimenez', 'Horton', 'Shelton', 'Barrett', 'Obrien', 'Castro', 'Sutton', 'Gregory', 'McKinney', 'Lucas', 'Miles', 'Craig',
  'Rodriquez', 'Chambers', 'Holt', 'Lambert', 'Fletcher', 'Watts', 'Bates', 'Hale', 'Rhodes', 'Pena', 'Beck', 'Newman', 'Haynes', 'McDaniel',
  'Mendez', 'Bush', 'Vaughn', 'Parks', 'Dawson', 'Santiago', 'Norris', 'Hardy', 'Love', 'Steele', 'Curry', 'Powers', 'Schultz', 'Barker',
  'Guzman', 'Page', 'Munoz', 'Ball', 'Keller', 'Chandler', 'Weber', 'Leonard', 'Walsh', 'Lyons', 'Ramsey', 'Wolfe', 'Mullins', 'Benson',
  'Sharp', 'Bowen', 'Daniel', 'Barber', 'Cummings', 'Hines', 'Baldwin', 'Griffith', 'Valdez', 'Hubbard', 'Salazar', 'Reeves', 'Warner',
  'Stevenson', 'Burgess', 'Santos', 'Tate', 'Cross', 'Garner', 'Mann', 'Mack', 'Moss', 'Thornton', 'Dennis', 'McGee', 'Farmer', 'Delgado',
  'Aguilar', 'Vega', 'Glover', 'Manning', 'Cohen', 'Harmon', 'Rodgers', 'Robbins', 'Newton', 'Todd', 'Blair', 'Higgins', 'Ingram', 'Reese',
  'Cannon', 'Strickland', 'Townsend', 'Potter', 'Goodwin', 'Walton', 'Rowe', 'Hampton', 'Ortega', 'Patton', 'Swanson', 'Joseph', 'Francis',
  'Goodman', 'Maldonado', 'Yates', 'Becker', 'Erickson', 'Hodges', 'Rios', 'Conner', 'Adkins', 'Webster', 'Norman', 'Malone', 'Hammond',
  'Flowers', 'Cobb', 'Moody', 'Quinn', 'Blake', 'Maxwell', 'Pope', 'Floyd', 'Osborne', 'Paul', 'McCarthy', 'Guerrero', 'Lindsey', 'Estrada',
  'Sandoval', 'Gibbs', 'Tyler', 'Gross', 'Fitzgerald', 'Stokes', 'Doyle', 'Sherman', 'Saunders', 'Wise', 'Colon', 'Gill', 'Alvarado',
  'Greer', 'Padilla', 'Simon', 'Waters', 'Nunez', 'Ballard', 'Schwartz', 'McBride', 'Houston', 'Christensen', 'Klein', 'Pratt', 'Briggs',
  'Parsons', 'McLaughlin', 'Zimmerman', 'French', 'Buchanan', 'Moran', 'Copeland', 'Roy', 'Pittman', 'Brady', 'McCormick', 'Holloway',
  'Brock', 'Poole', 'Frank', 'Logan', 'Owen', 'Bass', 'Marsh', 'Drake', 'Wong', 'Jefferson', 'Park', 'Morton', 'Abbott', 'Sparks', 'Patrick',
  'Norton', 'Huff', 'Clayton', 'Massey', 'Lloyd', 'Figueroa', 'Carson', 'Bowers', 'Roberson', 'Barton', 'Tran', 'Lamb', 'Harrington',
  'Casey', 'Boone', 'Cortez', 'Clarke', 'Mathis', 'Singleton', 'Wilkins', 'Cain', 'Bryan', 'Underwood', 'Hogan', 'McKenzie', 'Collier',
  'Luna', 'Phelps', 'McGuire', 'Allison', 'Bridges', 'Wilkerson', 'Nash', 'Summers', 'Atkins', 'Mbeki', 'Diallo', 'Okoye'];
const INTL = [
  ['Spain', ['Pablo', 'Jorge', 'Sergio', 'Alvaro', 'Javier', 'Alberto', 'Felipe', 'Raul'], ['Garcia', 'Martinez', 'Lopez', 'Sanchez', 'Ortega', 'Molina', 'Iglesias', 'Serrano']],
  ['Serbia', ['Nikola', 'Dejan', 'Milos', 'Stefan', 'Predrag', 'Zoran', 'Bogdan', 'Marko'], ['Jovanovic', 'Nikolic', 'Pavlovic', 'Ilic', 'Stankovic', 'Lazic', 'Kostic', 'Djuric']],
  ['France', ['Thomas', 'Julien', 'Mickael', 'Hugo', 'Johan', 'Florent', 'Antoine', 'Yohan'], ['Dubois', 'Laurent', 'Moreau', 'Girard', 'Lefevre', 'Bonnet', 'Fontaine', 'Mercier']],
  ['Lithuania', ['Tomas', 'Mindaugas', 'Darius', 'Linas', 'Paulius', 'Ramunas', 'Rimas', 'Mantas'], ['Kazlauskas', 'Petrauskas', 'Jankauskas', 'Stankevicius', 'Vaitkus', 'Zukauskas', 'Bagdonas', 'Paulauskas']],
  ['Brazil', ['Leandro', 'Thiago', 'Anderson', 'Rafael', 'Marcelo', 'Bruno', 'Guilherme', 'Vitor'], ['Oliveira', 'Souza', 'Pereira', 'Costa', 'Almeida', 'Carvalho', 'Ribeiro', 'Teixeira']],
  ['Argentina', ['Facundo', 'Andres', 'Luis', 'Federico', 'Carlos', 'Pablo', 'Walter', 'Hernan'], ['Gomez', 'Fernandez', 'Diaz', 'Alvarez', 'Acosta', 'Sosa', 'Benitez', 'Quiroga']],
  ['Germany', ['Lukas', 'Jonas', 'Maximilian', 'Patrick', 'Tim', 'Johannes', 'Robert', 'Niklas'], ['Schneider', 'Fischer', 'Becker', 'Hoffmann', 'Schulz', 'Koch', 'Richter', 'Wolf']],
  ['Nigeria', ['Olumide', 'Chukwuemeka', 'Ike', 'Obinna', 'Tunde', 'Ekpe', 'Solomon', 'Ejike'], ['Adeyemi', 'Okonkwo', 'Eze', 'Nwosu', 'Balogun', 'Ogunleye', 'Afolabi', 'Chukwu']],
  ['Turkey', ['Mehmet', 'Emre', 'Kerem', 'Burak', 'Omer', 'Ibrahim', 'Cenk', 'Serkan'], ['Yilmaz', 'Kaya', 'Demir', 'Sahin', 'Celik', 'Aydin', 'Ozturk', 'Arslan']],
  ['Greece', ['Nikos', 'Dimitris', 'Georgios', 'Kostas', 'Antonis', 'Ioannis', 'Vassilis', 'Panagiotis'], ['Papadakis', 'Nikolaidis', 'Georgiou', 'Konstantinou', 'Vlachos', 'Karras', 'Dimitriou', 'Alexiou']],
  ['China', ['Wei', 'Jun', 'Hao', 'Lei', 'Tao', 'Ming', 'Bo', 'Qiang'], ['Zhang', 'Li', 'Wang', 'Liu', 'Chen', 'Yang', 'Zhao', 'Huang']],
  ['Australia', ['Liam', 'Brodie', 'Corey', 'Mitch', 'Jack', 'Nathan', 'Brad', 'Sam'], ['Kennedy', 'Walsh', 'Fraser', 'McKenzie', 'Gallagher', 'Doyle', 'Hartley', 'Pemberton']],
];
// Real-world star names a random first+last pairing could produce. Re-rolled when hit.
const NAME_BLOCK = new Set(['Tony Parker', 'Paul Pierce', 'Chris Paul', 'Reggie Miller', 'Andre Miller', 'Mo Williams', 'Marvin Williams',
  'Corey Brewer', 'Ronnie Brewer', 'Josh Howard', 'Kenny Thomas', 'Isaiah Thomas', 'Troy Murphy', 'Troy Hudson', 'Eric Gordon', 'Kevin Love',
  'Marcus Thornton', 'Nick Young', 'Ricky Davis', 'Shawn Bradley', 'Grant Hill', 'Tyrone Hill', 'Bobby Jackson', 'Darnell Jackson',
  'Kendrick Perkins', 'Sam Perkins', 'Nate Robinson', 'Desmond Mason', 'Wesley Johnson', 'Brandon Roy', 'Brandon Bass', 'Brandon Jennings',
  'Brandon Knight', 'Marcus Morris', 'Jamal Crawford', 'Reggie Evans', 'Maurice Evans', 'Derrick Williams', 'Tony Allen', 'Malik Allen',
  'Damon Jones', 'Fred Jones', 'Bobby Jones', 'Earl Watson', 'Kevin Willis', 'Aaron Brooks', 'Michael Curry', 'Michael Jordan',
  'Dwayne Wade', 'Gerald Wallace', 'Antoine Walker', 'Jerome Williams', 'Eric Williams', 'Aaron Williams', 'Marcus Williams', 'Jason Williams',
  'Jason Richardson', 'Jason Terry', 'Jason Collins', 'Kevin Martin', 'Anthony Carter', 'Marcus Banks', 'Brian Cook', 'Derrick Coleman',
  'Antoine Wright', 'Kevin Johnson', 'Larry Johnson', 'Eddie Jones', 'James Jones', 'Kyle Lowry', 'Chris Mullins', 'Glen Davis',
  'Terrence Williams', 'Shawn Williams', 'Marcus Camby', 'Tracy McGrady', 'Kevin Garnett', 'Jalen Rose', 'Steve Nash', 'Kobe Bryant',
  'Michael Finley', 'Josh Smith', 'Michael Redd', 'Ray Allen', 'Chris Webber', 'Ben Wallace', 'Tim Duncan', 'Vince Carter', 'Dirk Nowitzki',
  'Wardell Curry', 'Michael Cooper', 'Byron Scott', 'Kevin McHale', 'Larry Bird', 'Dennis Johnson', 'Kenny Smith', 'Mario Elie',
  'Robert Horry', 'Dale Ellis', 'Monte Ellis', 'Glenn Robinson', 'David Robinson', 'Jerome Kersey', 'Clyde Drexler', 'Terry Porter',
  'Kevin Porter', 'Tyler Johnson', 'Jordan Clarkson', 'Jordan Crawford', 'Marcus Smart', 'Shaun Livingston', 'Darius Miles', 'Quentin Richardson',
  'Corey Maggette', 'Elijah Johnson', 'Devin Harris', 'Devin Brown', 'Kyle Korver', 'Chris Wilcox', 'Will Barton', 'Jarrett Jack',
  'Raymond Felton', 'Luther Head', 'Gilbert Arenas', 'Rodney Carney', 'Carl Landry', 'Keith Bogans', 'Mike James', 'Mike Bibby',
  'Darius Garland', 'Jalen Green', 'Jalen Williams', 'Jalen Johnson', 'Jalen Brunson', 'Tyler Herro', 'Evan Turner', 'Evan Fournier',
  'Aaron Gordon', 'Drew Gooden', 'Vernon Maxwell', 'Cedric Maxwell', 'Cedric Ceballos', 'Otis Thorpe', 'Sam Cassell', 'Sam Mitchell',
  'Rick Fox', 'Rick Barry', 'Rodney Rogers', 'Carlos Rogers', 'Kenny Anderson', 'Nick Anderson', 'Greg Anderson', 'Mookie Blaylock',
  'Mario Chalmers', 'Mason Plumlee', 'Kendrick Nunn', 'Jerome Moiso', 'Willie Green', 'Walt Williams', 'Bernard King', 'Byron Mullens']);
const COLLEGES = ['Duke', 'North Carolina', 'Kentucky', 'Kansas', 'UCLA', 'Indiana', 'Michigan State', 'Syracuse', 'Connecticut', 'Arizona',
  'Georgetown', 'Louisville', 'Villanova', 'Florida', 'Ohio State', 'Texas', 'Gonzaga', 'Wake Forest', 'Maryland', 'Memphis', 'Illinois',
  'Wisconsin', 'Oklahoma State', 'Georgia Tech', 'Stanford', 'Cincinnati', 'Marquette', 'Pittsburgh', 'Xavier', 'Saint Joseph\'s', 'LSU',
  'Notre Dame', 'Iowa State', 'Washington', 'Oregon', 'Arkansas', 'Alabama', 'Tennessee', 'Utah', 'BYU', 'Creighton', 'Butler', 'Temple',
  'Seton Hall', 'St. John\'s', 'Providence', 'DePaul', 'Fresno State', 'UNLV', 'New Mexico', 'Southern Miss', 'Old Dominion', 'Davidson',
  'Murray State', 'Weber State', 'Western Kentucky', 'Boston College', 'Clemson', 'Virginia', 'Miami (FL)', 'USC', 'California', 'Purdue',
  'Michigan', 'Minnesota', 'Missouri', 'Nebraska', 'Colorado', 'Texas A&M', 'Baylor', 'Houston', 'Rutgers', 'Penn State', 'Vanderbilt'];
const PREP = 'High School';

const INJURIES = [
  // name, minGames, maxGames, weight
  ['Sprained Ankle', 1, 6, 30], ['Bruised Knee', 1, 3, 14], ['Back Spasms', 1, 4, 12], ['Hamstring Strain', 3, 10, 10],
  ['Groin Strain', 2, 9, 8], ['Sprained Finger', 1, 3, 10], ['Concussion', 1, 5, 4], ['Calf Strain', 3, 10, 7],
  ['Sprained Wrist', 2, 8, 6], ['Bone Bruise', 4, 12, 5], ['Plantar Fasciitis', 5, 18, 4], ['Broken Nose', 1, 4, 4],
  ['Torn Meniscus', 15, 35, 3], ['Broken Hand', 12, 25, 3], ['High Ankle Sprain', 8, 20, 4], ['Stress Fracture (Foot)', 18, 45, 2],
  ['Torn Achilles', 60, 82, 0.6], ['Torn ACL', 60, 82, 0.7], ['Dislocated Shoulder', 10, 30, 2], ['Patellar Tendinitis', 3, 12, 5],
];

const CORPS = ['Ironclad Insurance', 'Bluefin Bank', 'Corvane Wireless', 'Atlas Freight', 'Pinnacle Health', 'Redwood Mutual', 'Northgate Airlines',
  'Halcyon Motors', 'Vantage Telecom', 'Granite Trust', 'Brightwater Cola', 'Sterling Steelworks', 'Copperline Energy', 'Meridian Foods',
  'Harborlight Bank', 'Crestview Credit Union', 'TriCounty Electric', 'Oakmont Brewing', 'Lumen Software', 'Orbitel Communications',
  'Cascade Water', 'Keystone Grocers', 'Paragon Auto Group', 'Silverline Rail', 'Waypoint Logistics'];

const ARENA_SUFFIX = ['Arena', 'Center', 'Coliseum', 'Fieldhouse', 'Garden', 'Pavilion', 'Dome'];

const PERSONALITIES = {
  leader: { n: 'Leader', d: 'Steadies the locker room. Boosts team chemistry.' },
  winner: { n: 'Competitor', d: 'Lives to win. Happiest on a contender.' },
  mercenary: { n: 'Mercenary', d: 'Follows the money in contract talks.' },
  loyal: { n: 'Loyal', d: 'Values staying put. Gives a hometown discount.' },
  diva: { n: 'Diva', d: 'Wants the spotlight, minutes and shots.' },
  gymrat: { n: 'Gym Rat', d: 'First in, last out. Develops faster.' },
  easy: { n: 'Easygoing', d: 'Rarely rattled by role or results.' },
};

const RADIO = {
  show: 'Full Court Press', host: 'Sal "The Pipe" Moretti', cohost: 'Denise Holloway', station: 'The Fan 1080 AM',
  callerFirst: ['Dave', 'Big Mike', 'Tony', 'Linda', 'Ray', 'Marcus', 'Pete', 'Angela', 'Steve', 'Jerome', 'Frankie', 'Donna', 'Earl', 'Tasha', 'Vinny', 'Carl', 'Rosa', 'Lou', 'Kenny', 'Barb'],
  callerTown: ['the North Side', 'downtown', 'the suburbs', 'across the river', 'the east end', 'out by the airport', 'the old neighborhood', 'the truck stop', 'the barbershop', 'the night shift'],
};

const PAPER_NAMES = ['Courier', 'Ledger', 'Tribune', 'Herald', 'Post-Dispatch', 'Gazette', 'Daily News', 'Sentinel', 'Star', 'Chronicle'];
const WRITERS = ['Mike Delahunt', 'Carla Brooks', 'Jim Petrakis', 'Reggie Sloan', 'Annette Kim', 'Bob Whitfield', 'Tom Galloway', 'Pat Riordan'];

// ===== player.js =====
const RK = ['ins', 'mid', 'tpt', 'ft', 'pas', 'bhd', 'orb', 'drb', 'pdf', 'idf', 'stl', 'blk', 'spd', 'str', 'jmp', 'sta', 'iq', 'dur'];
const RSHORT = { ins: 'INS', mid: 'MID', tpt: '3PT', ft: 'FT', pas: 'PAS', bhd: 'BHD', orb: 'ORB', drb: 'DRB', pdf: 'PDF', idf: 'IDF', stl: 'STL', blk: 'BLK', spd: 'SPD', str: 'STR', jmp: 'JMP', sta: 'STA', iq: 'IQ', dur: 'DUR' };
const RLONG = { ins: 'Inside Scoring', mid: 'Mid-Range', tpt: 'Three-Point', ft: 'Free Throw', pas: 'Passing', bhd: 'Ball Handling', orb: 'Off. Rebounding', drb: 'Def. Rebounding', pdf: 'Perimeter Defense', idf: 'Interior Defense', stl: 'Steal', blk: 'Block', spd: 'Speed', str: 'Strength', jmp: 'Vertical', sta: 'Stamina', iq: 'Basketball IQ', dur: 'Durability' };
const RGROUPS = [['Scoring', ['ins', 'mid', 'tpt', 'ft']], ['Playmaking', ['pas', 'bhd', 'iq']], ['Rebounding', ['orb', 'drb']], ['Defense', ['pdf', 'idf', 'stl', 'blk']], ['Athleticism', ['spd', 'str', 'jmp', 'sta', 'dur']]];
const POSS = ['PG', 'SG', 'SF', 'PF', 'C'];
const POS_IDX = { PG: 0, SG: 1, SF: 2, PF: 3, C: 4 };
const PHYS = { spd: 1, str: 1, jmp: 1, sta: 1, dur: 1 };
const POS_BASE = {
  PG: { ins: 50, mid: 55, tpt: 55, ft: 72, pas: 70, bhd: 72, orb: 30, drb: 38, pdf: 58, idf: 30, stl: 58, blk: 22, spd: 75, str: 40, jmp: 62, sta: 70, iq: 58, dur: 72 },
  SG: { ins: 54, mid: 58, tpt: 58, ft: 72, pas: 55, bhd: 62, orb: 35, drb: 42, pdf: 58, idf: 35, stl: 55, blk: 28, spd: 70, str: 46, jmp: 64, sta: 70, iq: 55, dur: 72 },
  SF: { ins: 58, mid: 55, tpt: 50, ft: 68, pas: 50, bhd: 52, orb: 45, drb: 52, pdf: 56, idf: 48, stl: 50, blk: 40, spd: 64, str: 56, jmp: 62, sta: 68, iq: 55, dur: 72 },
  PF: { ins: 62, mid: 50, tpt: 36, ft: 63, pas: 42, bhd: 40, orb: 60, drb: 65, pdf: 45, idf: 60, stl: 42, blk: 55, spd: 54, str: 68, jmp: 58, sta: 66, iq: 55, dur: 72 },
  C: { ins: 64, mid: 42, tpt: 24, ft: 58, pas: 38, bhd: 32, orb: 68, drb: 72, pdf: 38, idf: 66, stl: 38, blk: 66, spd: 45, str: 75, jmp: 52, sta: 62, iq: 54, dur: 72 },
};
const HGT = { PG: [74.5, 1.4], SG: [77, 1.2], SF: [79, 1.1], PF: [81, 1.1], C: [83.5, 1.3] };
const WGT = { PG: 190, SG: 205, SF: 222, PF: 242, C: 258 };
const OVR_W = {
  PG: { tpt: .12, mid: .10, ins: .08, pas: .17, bhd: .15, pdf: .10, stl: .05, spd: .10, iq: .10, ft: .03 },
  SG: { tpt: .18, mid: .14, ins: .12, bhd: .09, pas: .06, pdf: .12, stl: .05, spd: .09, iq: .07, jmp: .05, ft: .03 },
  SF: { ins: .14, mid: .12, tpt: .12, pdf: .11, idf: .05, drb: .06, orb: .03, spd: .08, jmp: .08, str: .06, pas: .06, iq: .09 },
  PF: { ins: .18, mid: .08, tpt: .03, drb: .12, orb: .08, idf: .14, blk: .08, str: .12, jmp: .08, iq: .06, pas: .03 },
  C: { ins: .17, drb: .14, orb: .10, idf: .16, blk: .14, str: .13, jmp: .06, iq: .06, pas: .02, ft: .02 },
};
const ARCH = {
  PG: [['Floor General', { pas: 12, iq: 10, bhd: 5, ins: -4, jmp: -3 }], ['Scoring Guard', { tpt: 9, mid: 9, bhd: 6, pas: -6 }],
    ['Slashing Guard', { ins: 10, spd: 7, jmp: 7, tpt: -6, mid: -3 }], ['Defensive Pest', { pdf: 12, stl: 12, mid: -4, tpt: -4 }]],
  SG: [['Sharpshooter', { tpt: 13, ft: 8, mid: 5, ins: -5, pdf: -4 }], ['Slasher', { ins: 11, jmp: 9, spd: 5, tpt: -7 }],
    ['3-and-D Wing', { tpt: 8, pdf: 11, stl: 5, bhd: -5, ins: -4 }], ['Shot Creator', { mid: 11, bhd: 8, ins: 4, pdf: -5 }]],
  SF: [['Point Forward', { pas: 12, bhd: 9, iq: 6, jmp: -3 }], ['Two-Way Wing', { pdf: 10, idf: 6, ins: 4, tpt: 3, pas: -4 }],
    ['Volume Scorer', { ins: 8, mid: 8, tpt: 6, pdf: -6 }], ['Athletic Wing', { jmp: 12, spd: 8, ins: 6, mid: -5, iq: -3 }]],
  PF: [['Stretch Four', { tpt: 18, mid: 10, ft: 6, orb: -6, blk: -5, str: -4 }], ['Bruiser', { str: 10, orb: 9, drb: 7, idf: 6, mid: -5, spd: -4 }],
    ['High Flyer', { jmp: 12, ins: 8, blk: 6, mid: -5, iq: -3 }], ['Post Scorer', { ins: 12, mid: 5, str: 4, pdf: -5 }]],
  C: [['Rim Protector', { blk: 14, idf: 12, drb: 5, ins: -6, ft: -6 }], ['Post Anchor', { ins: 13, str: 6, iq: 3, blk: -5 }],
    ['Glass Cleaner', { orb: 13, drb: 12, str: 5, mid: -6 }], ['Stretch Big', { mid: 12, tpt: 15, ft: 10, orb: -5, str: -5 }]],
};
// normalize OVR so an average (talent 50) player of any position grades ~70
const OVR_OFF = {};
for (const pos of POSS) {
  let raw = 0;
  for (const k in OVR_W[pos]) {
    const ab = U.avg(ARCH[pos], a => a[1][k] || 0);
    raw += OVR_W[pos][k] * (POS_BASE[pos][k] + ab);
  }
  OVR_OFF[pos] = 70 - raw;
}

function rawOvr(r, pos) { let s = 0; const w = OVR_W[pos]; for (const k in w) s += r[k] * w[k]; return s + OVR_OFF[pos]; }
function calcOvr(r, pos) { return U.clamp(Math.round(rawOvr(r, pos)), 25, 99); }
function bestPosOvr(r) { let best = 'PG', bv = 0; for (const p of POSS) { const v = rawOvr(r, p); if (v > bv) { bv = v; best = p; } } return best; }

function genName(intlChance = 0.14) {
  for (let i = 0; i < 20; i++) {
    if (Math.random() < intlChance) {
      const c = U.pick(INTL);
      return { fn: U.pick(c[1]), ln: U.pick(c[2]), country: c[0] };
    }
    const fn = U.pick(FIRST), ln = U.pick(LAST);
    if (!NAME_BLOCK.has(fn + ' ' + ln)) return { fn, ln, country: 'USA' };
  }
  return { fn: 'Johnny', ln: 'Doe', country: 'USA' };
}

const PERS_W = [['leader', 10], ['winner', 16], ['mercenary', 16], ['loyal', 12], ['diva', 10], ['gymrat', 12], ['easy', 24]];

function genPlayer(S, o) {
  const pos = o.pos || U.pick(POSS);
  const T = o.talent;
  const arch = U.pick(ARCH[pos]);
  const hgt = Math.round(U.gauss(HGT[pos][0], HGT[pos][1]));
  const hd = hgt - HGT[pos][0];
  const r = {};
  for (const k of RK) r[k] = POS_BASE[pos][k] + (T - 50) * (PHYS[k] ? 0.55 : 0.95) + (arch[1][k] || 0) + U.gauss(0, 7);
  r.orb += hd * 2; r.drb += hd * 2; r.blk += hd * 2.5; r.idf += hd * 1.5; r.spd -= hd * 1.5; r.bhd -= hd * 1.2;
  r.ft = 0.5 * r.ft + 0.25 * r.mid + 0.25 * r.tpt + 8 + U.gauss(0, 4);
  r.dur = U.gauss(72, 12);
  r.sta = U.gauss(POS_BASE[pos].sta + (T - 50) * 0.3, 8);
  for (const k of RK) r[k] = Math.round(U.clamp(r[k], 20, 99));
  const nm = o.name || genName(o.intl);
  const age = o.age;
  const p = {
    pid: S.nextPid++, tid: o.tid != null ? o.tid : -1, fn: nm.fn, ln: nm.ln, country: nm.country, pos, age, hgt,
    wgt: Math.round(WGT[pos] + hd * 5 + U.gauss(0, 9)), arch: arch[0], r, ovr: 0, pot: 0,
    college: nm.country !== 'USA' ? nm.country : (age <= 20 && T > 60 && Math.random() < 0.3 ? PREP : U.pick(COLLEGES)),
    pers: U.wpick(PERS_W, x => x[1])[0], morale: 65, contract: { amt: 0, exp: S.season }, inj: null,
    stats: [], awards: [], yrsPro: Math.max(0, age - U.ri(19, 22)), num: 0, joined: S.season, draft: null, hist: [], prom: null,
  };
  p.ovr = calcOvr(r, pos);
  p.pot = o.pot != null ? o.pot : potFor(p.ovr, age);
  return p;
}

function potFor(ovr, age) {
  let g;
  if (age <= 19) g = U.gauss(18, 6); else if (age <= 20) g = U.gauss(15, 6); else if (age <= 21) g = U.gauss(12, 5);
  else if (age <= 22) g = U.gauss(9, 4.5); else if (age <= 23) g = U.gauss(6.5, 4); else if (age <= 24) g = U.gauss(4.5, 3);
  else if (age <= 26) g = U.gauss(2, 2); else g = 0;
  return U.clamp(Math.round(ovr + Math.max(0, g)), ovr, 99);
}

function potGrade(pot) { return U.grade(pot); }
function pname(p) { return p.fn + ' ' + p.ln; }
function pshort(p) { return p.fn[0] + '. ' + p.ln; }

// "worth" on the OVR scale, folding in age and upside
function playerWorth(p) {
  let v = p.ovr;
  if (p.age <= 25) v += (p.pot - p.ovr) * (p.age <= 21 ? 0.45 : p.age <= 23 ? 0.33 : 0.2);
  if (p.age >= 30) v -= (p.age - 29) * 1.1;
  if (p.inj && p.inj.games > 40) v -= 3;
  return v;
}

function marketSalary(S, p) {
  const v = playerWorth(p);
  const x = U.clamp((v - 55) / 40, 0, 1.12);
  let sal = 450 + 19800 * Math.pow(x, 2.15);
  sal *= S.cap / 49500;
  return Math.round(U.clamp(sal, S.minSal, S.maxSal) / 10) * 10;
}

function askYears(p) {
  if (p.age <= 24) return U.ri(3, 5);
  if (p.age <= 29) return U.ri(3, 5);
  if (p.age <= 32) return U.ri(2, 3);
  return U.ri(1, 2);
}

// trade/asset value: convex so stars dominate
function tradeValue(S, p, mode) {
  let w = playerWorth(p);
  if (mode === 'rebuild') { if (p.age >= 29) w -= (p.age - 28) * 1.5; if (p.age <= 24) w += 2; }
  if (mode === 'contend') { w += (p.ovr - w) * 0.5; if (p.age <= 22) w -= 1.5; }
  let v = Math.pow(Math.max(0, w - 45) / 10, 3.1) * 2.2;
  const yrs = Math.max(1, p.contract.exp - S.season + 1);
  const fair = marketSalary(S, p);
  const over = (p.contract.amt - fair) / 1000; // $M per year overpaid
  v -= over * Math.min(yrs, 4) * 1.4;
  if (p.inj) v -= Math.min(p.inj.games, 82) / 82 * v * 0.5;
  return v;
}

function devPlayer(p, delta, opts = {}) {
  const age = p.age;
  for (const k of RK) {
    let d = delta * (1 + U.gauss(0, 0.7));
    if (PHYS[k] && k !== 'str' && k !== 'dur') {
      if (age >= 30) d -= (age - 29) * 0.9 + U.rf(0, 1.2);
      else if (age <= 22) d += U.rf(0, 1.0);
    }
    if (k === 'iq') d = Math.abs(delta) * 0.3 + (age >= 27 ? U.rf(0, 1.5) : U.rf(0, 2));
    if (k === 'str' && age <= 26) d += U.rf(0, 1.5);
    if (k === 'dur') d = age >= 31 ? -U.rf(0, 2.5) : U.gauss(0, 1);
    p.r[k] = Math.round(U.clamp(p.r[k] + d, 15, 99));
  }
  // correct drift so OVR change lands near target
  const before = p.ovr, target = before + delta;
  let now = rawOvr(p.r, p.pos);
  const fix = (target - now);
  if (Math.abs(fix) > 0.5) {
    const ks = Object.keys(OVR_W[p.pos]);
    for (const k of ks) p.r[k] = Math.round(U.clamp(p.r[k] + fix, 15, 99));
  }
  p.ovr = calcOvr(p.r, p.pos);
  return p.ovr - before;
}

// season-end development. ctx: {coachDev, facility, mpg, asst}
function progressPlayer(p, ctx = {}) {
  const age = p.age;
  let d;
  const gap = Math.max(0, p.pot - p.ovr);
  if (age <= 26) {
    const f = age <= 19 ? 0.32 : age <= 20 ? 0.30 : age <= 21 ? 0.27 : age <= 22 ? 0.24 : age <= 23 ? 0.21 : age <= 24 ? 0.18 : age <= 25 ? 0.14 : 0.10;
    d = gap * f + U.gauss(0, 2.2);
    if (ctx.mpg != null) d += U.clamp((ctx.mpg - 15) / 20, -0.6, 0.8);
  } else if (age <= 29) d = U.gauss(-0.4, 1.4);
  else d = -(age - 29) * 0.95 - 0.4 + U.gauss(0, 1.5);
  d += ((ctx.coachDev || 60) - 60) / 40 + (ctx.facility || 0) * 0.35 + ((ctx.asst || 60) - 60) / 60;
  if (p.pers === 'gymrat') d += 0.6;
  if (d > 0 && p.ovr >= 88) d *= 0.5;
  if (age >= 33 && Math.random() < 0.15) d -= U.rf(2, 5);
  d = Math.round(U.clamp(d, -12, 14));
  const res = devPlayer(p, d);
  if (age <= 25) p.pot = U.clamp(Math.round(p.pot + U.gauss(-0.3, 2.0)), 40, 99);
  else p.pot = Math.min(p.pot, p.ovr + (age <= 27 ? 2 : 0));
  return res;
}

function isRookie(S, p) { return p.draft && p.draft.year === S.season + 0 && p.yrsPro === 0; }

function seasonRow(p, season, tid, po) {
  let row = p.stats.find(s => s.s === season && s.tid === tid && s.po === po);
  if (!row) {
    row = { s: season, tid, po, gp: 0, gs: 0, min: 0, pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, orb: 0, drb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0 };
    p.stats.push(row);
  }
  return row;
}

const STAT_KEYS = ['gp', 'gs', 'min', 'pts', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'orb', 'drb', 'ast', 'stl', 'blk', 'tov', 'pf'];
function sumRows(rows) {
  const t = {}; for (const k of STAT_KEYS) t[k] = 0;
  for (const r of rows) for (const k of STAT_KEYS) t[k] += r[k] || 0;
  return t;
}
function seasonTotals(p, season, po = 0) { return sumRows(p.stats.filter(s => s.s === season && s.po === po)); }
function careerTotals(p, po = 0) { return sumRows(p.stats.filter(s => s.po === po)); }
function perGame(t) {
  const g = t.gp || 1;
  return {
    gp: t.gp, gs: t.gs, mpg: t.min / g, ppg: t.pts / g, rpg: (t.orb + t.drb) / g, apg: t.ast / g, spg: t.stl / g, bpg: t.blk / g, tpg: t.tov / g,
    fgp: t.fga ? t.fgm / t.fga : 0, tpp: t.tpa ? t.tpm / t.tpa : 0, ftp: t.fta ? t.ftm / t.fta : 0,
    eff: (t.pts + t.orb + t.drb + t.ast + t.stl + t.blk - (t.fga - t.fgm) - (t.fta - t.ftm) - t.tov) / g,
  };
}

// ===== league.js =====
const PH = { PRE: 0, REG: 1, PO: 2, END: 3, LOTTERY: 4, DRAFT: 5, RESIGN: 6, FA: 7 };
const PH_NAME = ['Preseason', 'Regular Season', 'Playoffs', 'Season Review', 'Draft Lottery', 'Draft', 'Re-sign Players', 'Free Agency'];
const DIFFS = [
  { n: 'Rookie', trade: 0.92, fa: 0.15, boost: 0.015, rev: 1.12 },
  { n: 'Starter', trade: 1.05, fa: 0.0, boost: 0, rev: 1.0 },
  { n: 'All-Star', trade: 1.15, fa: -0.06, boost: -0.008, rev: 0.95 },
  { n: 'Hall of Fame', trade: 1.25, fa: -0.12, boost: -0.016, rev: 0.9 },
];

let PMAP = new Map();
function reindex(S) { PMAP = new Map(); for (const p of S.players) PMAP.set(p.pid, p); for (const p of S.retired) PMAP.set(p.pid, p); }
function P(S, pid) { return PMAP.get(pid); }
function addPlayer(S, p) { S.players.push(p); PMAP.set(p.pid, p); return p; }
function roster(S, tid) { return S.players.filter(p => p.tid === tid); }
function T(S, tid) { return S.teams[tid]; }
function tname(t) { return t.region + ' ' + t.name; }
function payroll(S, tid) {
  let s = 0; for (const p of S.players) if (p.tid === tid) s += p.contract.amt;
  for (const d of S.teams[tid].dead) if (d.exp >= S.season) s += d.amt;
  return s;
}
function payrollNext(S, tid) { // committed for next season
  let s = 0; for (const p of S.players) if (p.tid === tid && p.contract.exp > S.season) s += p.contract.next || p.contract.amt;
  for (const d of S.teams[tid].dead) if (d.exp > S.season) s += d.amt;
  return s;
}
function isUser(S, tid) { return tid === S.user; }

function genStaff(S, role, quality) {
  const nm = genName(0.05);
  const q = quality != null ? quality : U.gauss(60, 12);
  const r = () => Math.round(U.clamp(q + U.gauss(0, 9), 25, 99));
  const st = { id: S.nextSid++, role, fn: nm.fn, ln: nm.ln, age: U.ri(36, 66), exp: S.season + U.ri(1, 4) };
  if (role === 'hc') { st.r = { off: r(), def: r(), dev: r(), mot: r() }; st.pace = U.pick([0, 1, 1, 2]); st.scheme = U.pick(['man', 'man', 'man', 'zone', 'press', 'paint', 'deny']); }
  else if (role === 'asst') st.r = { dev: r(), off: r(), def: r() };
  else if (role === 'trainer') st.r = { med: r(), cond: r() };
  else st.r = { eval: r(), net: r() };
  const avg = U.avg(Object.values(st.r));
  const base = { hc: [800, 6500], asst: [200, 1200], trainer: [150, 900], scout: [120, 700] }[role];
  st.sal = Math.round((base[0] + (base[1] - base[0]) * Math.pow(U.clamp((avg - 30) / 65, 0, 1), 1.6)) / 10) * 10;
  st.wins = 0; st.losses = 0; st.titles = 0;
  return st;
}
function staffName(st) { return st.fn + ' ' + st.ln; }
function staffOvr(st) { return Math.round(U.avg(Object.values(st.r))); }

function makeTeam(S, d, tid) {
  const [abbr, region, name, div, pop, c1, c2] = d;
  const cap = U.ri(17, 21) * 1000 + U.ri(0, 9) * 100;
  const t = {
    tid, abbr, region, name, div, conf: div < 3 ? 0 : 1, pop, c1, c2,
    hype: U.ri(35, 65), fan: U.ri(50, 70),
    arena: {
      name: (Math.random() < 0.6 ? U.pick(CORPS) + ' ' : region + ' ') + U.pick(ARENA_SUFFIX), cap, suites: U.ri(40, 90),
      cond: U.ri(55, 90), built: S.season - U.ri(2, 30), up: { suites: 0, board: 0, conc: 0, prac: 0, med: 0, fan: 0 }, build: null,
    },
    prices: { court: 0, lower: 0, upper: 0, food: 6, drink: 5, merch: 30, parking: 15 },
    cash: Math.round(U.rf(15, 45) * 1000), mkt: 1,
    staff: {}, strat: { off: 'balanced', def: 'man', pace: 1 },
    rot: { order: [], mins: {} }, autoRot: true,
    rec: null, hist: [], fin: null, finHist: [], mle: false, dead: [], debt: null,
  };
  const pf = priceFactor(pop);
  t.prices.court = Math.round(380 * pf / 5) * 5; t.prices.lower = Math.round(62 * pf); t.prices.upper = Math.round(24 * pf);
  t.staff.hc = genStaff(S, 'hc'); t.staff.asst = genStaff(S, 'asst'); t.staff.trainer = genStaff(S, 'trainer'); t.staff.scout = genStaff(S, 'scout');
  t.strat.pace = t.staff.hc.pace; t.strat.def = t.staff.hc.scheme;
  t.rec = newRec();
  return t;
}
function priceFactor(pop) { return 0.78 + 0.12 * Math.log(1 + pop); }
function newRec() { return { w: 0, l: 0, hw: 0, hl: 0, aw: 0, al: 0, cw: 0, cl: 0, dw: 0, dl: 0, pf: 0, pa: 0, str: 0, l10: [] }; }

function newLeague(opts) {
  const S = {
    v: 1, season: 2005, phase: PH.PRE, day: 0, user: opts.userTid, ownerName: opts.ownerName || 'Owner', diff: opts.diff != null ? opts.diff : 1,
    settings: { games: opts.games || 82, injuries: opts.injuries !== false, fantasy: !!opts.fantasy },
    cap: 49500, tax: 61700, minSal: 400, maxSal: 17300, mle: 5000,
    teams: [], players: [], retired: [], sched: [], playoffs: null, picks: [], news: [], inbox: [], radio: [], history: [], records: null, box: {},
    trans: [], fa: null, draft: null, lottery: null, allStar: null, allStarDay: 0, deadlineDay: 0, scout: { pts: 100, max: 100 },
    camp: null, nextPid: 1, nextGid: 1, nextNid: 1, nextSid: 1, nextPick: 1, hof: [], tradeBlock: [], offers: [], promises: [],
    created: Date.now(), saveName: opts.saveName || '', lastRadioDay: 0, gameSpeed: 1,
  };
  S.records = { game: { pts: [], reb: [], ast: [] }, season: { ppg: [], rpg: [], apg: [] }, team: { wins: [] } };
  TEAM_DEFS.forEach((d, i) => S.teams.push(makeTeam(S, d, i)));
  reindex(S);
  // rosters: tiered talent so every team has a star, starters and depth
  const tiers = [[70, 4], [63, 4], [62, 4], [57, 4], [56, 4], [51, 4], [50, 4], [48, 4], [45, 4], [43, 5], [41, 5], [40, 5], [38, 5]];
  const posPlan = ['PG', 'SG', 'SF', 'PF', 'C', 'PG', 'SG', 'SF', 'PF', 'C', null, null, null];
  for (const t of S.teams) {
    const off = U.gauss(0, 1.8);
    const plan = U.shuffle(posPlan.map(x => x || U.pick(POSS)));
    tiers.forEach((tier, i) => {
      let age = Math.round(U.clamp(U.gauss(i < 3 ? 27 : 26.5, 3.8), 19, 37));
      const talent = U.gauss(tier[0] + off, tier[1]) - Math.max(0, 25 - age) * 1.3;
      const p = genPlayer(S, { pos: plan[i], talent, age, tid: t.tid });
      addPlayer(S, p);
    });
  }
  // free agent pool
  for (let i = 0; i < 40; i++) addPlayer(S, genPlayer(S, { talent: U.gauss(41, 6), age: U.ri(22, 35), tid: -1 }));
  for (const p of S.players) {
    p.yrsPro = Math.max(0, p.age - U.ri(19, 22));
    if (p.tid >= 0) {
      p.contract = { amt: Math.round(marketSalary(S, p) * U.rf(0.75, 1.3) / 10) * 10, exp: S.season + U.ri(0, 4) };
      p.contract.amt = U.clamp(p.contract.amt, S.minSal, S.maxSal);
      p.joined = S.season - U.ri(0, Math.min(5, p.yrsPro));
      p.morale = U.ri(55, 80);
      p.draft = { year: S.season - p.yrsPro, rd: 0, pick: 0, tid: -1 };
    } else {
      p.contract = { amt: marketSalary(S, p), exp: S.season };
      p.draft = { year: S.season - p.yrsPro, rd: 0, pick: 0, tid: -1 };
    }
  }
  // pretend draft history for vets
  for (const p of S.players) {
    if (p.yrsPro > 0 && Math.random() < 0.8) { const pick = Math.round(U.clamp(U.gauss(70 - p.ovr * 0.6, 14), 1, 60)); p.draft.rd = pick <= 30 ? 1 : 2; p.draft.pick = pick; p.draft.tid = U.ri(0, 29); }
  }
  // keep payrolls sane
  for (const t of S.teams) {
    let pay = payroll(S, t.tid);
    const ps = roster(S, t.tid);
    if (pay > S.tax * 0.98) { const f = (S.tax * U.rf(0.85, 0.97)) / pay; ps.forEach(p => { p.contract.amt = Math.max(S.minSal, Math.round(p.contract.amt * f / 10) * 10); }); }
    else if (pay < S.cap * 0.82) { const f = (S.cap * U.rf(0.85, 1.0)) / pay; ps.forEach(p => { p.contract.amt = Math.min(S.maxSal, Math.round(p.contract.amt * f / 10) * 10); }); }
    assignNumbers(S, t.tid);
  }
  const ranked = U.sortBy(S.players.filter(p => p.tid >= -1), p => p.ovr);
  S.ovrTarget = U.avg(ranked.slice(0, 60), p => p.ovr);
  S.depTarget = U.avg(ranked.slice(60, 360), p => p.ovr);
  genPicks(S);
  genDraftClass(S, S.season + 1);
  genDraftClass(S, S.season + 2, true);
  for (const t of S.teams) autoRotation(S, t.tid);
  genSchedule(S);
  for (const t of S.teams) initFinances(S, t);
  S.scout = { pts: scoutPoints(S), max: scoutPoints(S) };
  return S;
}

function assignNumbers(S, tid) {
  const used = new Set((S.teams[tid].rafters || []).map(r => r.num));
  for (const p of roster(S, tid)) {
    if (p.num && !used.has(p.num)) { used.add(p.num); continue; }
    let n; let tries = 0;
    do { n = Math.random() < 0.7 ? U.ri(0, 35) : U.ri(36, 55); tries++; } while ((used.has(n) || n === 0 && Math.random() < 0.8) && tries < 50);
    p.num = n; used.add(n);
  }
}

function genPicks(S) {
  for (let y = S.season + 1; y <= S.season + 4; y++) {
    for (const t of S.teams) for (const rd of [1, 2]) {
      if (!S.picks.some(k => k.year === y && k.rd === rd && k.orig === t.tid)) S.picks.push({ id: S.nextPick++, year: y, rd, orig: t.tid, tid: t.tid });
    }
  }
}

function scoutPoints(S) { const sc = S.teams[S.user].staff.scout; return 80 + Math.round(sc.r.net * 0.6); }

function genDraftClass(S, year, partial) {
  if (S.players.some(p => p.tid === -2 && p.dyear === year)) return;
  const q = U.gauss(0, 2.5);
  const n = 64;
  for (let i = 0; i < n; i++) {
    const age = U.wpick([19, 20, 21, 22, 23], a => ({ 19: 18, 20: 24, 21: 26, 22: 24, 23: 8 })[a]);
    const topTier = i < 2 ? 12 : i < 6 ? 8 : i < 14 ? 5 : i < 30 ? 2 : 0;
    const talent = U.gauss(33 + q + topTier - (age - 19) * -0.8, 6.5);
    const p = genPlayer(S, { talent, age, tid: -2, intl: 0.16 });
    p.yrsPro = 0; p.dyear = year; p.contract = { amt: 0, exp: year };
    // upside skews younger
    let g;
    if (age <= 19) g = U.gauss(17, 6); else if (age <= 20) g = U.gauss(14, 6); else if (age <= 21) g = U.gauss(11, 5); else if (age <= 22) g = U.gauss(8, 4.5); else g = U.gauss(6, 4);
    if (Math.random() < 0.06) g += U.rf(6, 14); // late bloomer
    p.pot = U.clamp(Math.round(p.ovr + Math.max(1, g)), p.ovr + 1, 97);
    p.sn = { o: U.gauss(0, 1), p: U.gauss(0, 1) }; p.slvl = 0;
    p.morale = 70; p.joined = year;
    addPlayer(S, p);
  }
}

// ---------- schedule ----------
function genSchedule(S) {
  const G = S.settings.games, n = S.teams.length;
  const games = [];
  const add = (h, a, k = 1) => { for (let i = 0; i < k; i++) games.push({ h, a }); };
  if (G === 82) {
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const a = S.teams[i], b = S.teams[j];
      if (a.div === b.div) { add(i, j, 2); add(j, i, 2); }
      else if (a.conf !== b.conf) { add(i, j); add(j, i); }
    }
    for (const c of [0, 1]) {
      const divs = [0, 1, 2].map(d => U.shuffle(S.teams.filter(t => t.div === c * 3 + d).map(t => t.tid)));
      for (const [x, y] of [[0, 1], [0, 2], [1, 2]]) {
        const A = divs[x], B = divs[y];
        for (let i = 0; i < 5; i++) for (let k = 0; k < 5; k++) {
          const a = A[i], b = B[(i + k) % 5];
          if (k === 0) { add(a, b, 2); add(b, a, 1); }
          else if (k === 1) { add(a, b, 1); add(b, a, 2); }
          else { add(a, b, 2); add(b, a, 2); }
        }
      }
    }
  } else if (G === 58) {
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { add(i, j); add(j, i); }
  } else {
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) { if ((i + j) % 2) add(i, j); else add(j, i); }
  }
  const targetDays = G === 82 ? 158 : G === 58 ? 112 : 58;
  const left = new Array(n).fill(0); games.forEach(g => { left[g.h]++; left[g.a]++; });
  const last = new Array(n).fill(-9);
  let pending = U.shuffle(games), day = 1;
  const perDay = games.length / targetDays;
  const out = [];
  while (pending.length) {
    const used = new Set(); let cnt = 0;
    const cap = Math.max(2, Math.round(perDay + U.gauss(0, 1.6)));
    pending.sort((x, y) => (left[y.h] + left[y.a]) - (left[x.h] + left[x.a]) + (Math.random() - 0.5) * 6);
    const rest = [];
    for (const g of pending) {
      const b2b = last[g.h] === day - 1 || last[g.a] === day - 1;
      if (cnt < cap && !used.has(g.h) && !used.has(g.a) && !(b2b && Math.random() < 0.6)) {
        used.add(g.h); used.add(g.a); cnt++; g.day = day; out.push(g); left[g.h]--; left[g.a]--; last[g.h] = day; last[g.a] = day;
      } else rest.push(g);
    }
    pending = rest; day++;
  }
  const totalDays = day - 1;
  S.allStarDay = Math.round(totalDays * 0.56);
  for (const g of out) if (g.day >= S.allStarDay) g.day += 4;
  S.deadlineDay = Math.round(totalDays * 0.68) + 4;
  S.lastDay = totalDays + 4;
  out.sort((a, b) => a.day - b.day);
  S.sched = out.map(g => ({ gid: S.nextGid++, day: g.day, h: g.h, a: g.a, hs: null, as: null, ot: 0 }));
}

function teamGames(S, tid) { return S.sched.filter(g => g.h === tid || g.a === tid); }
function nextGame(S, tid) { return S.sched.find(g => g.hs == null && (g.h === tid || g.a === tid)); }
function gamesOnDay(S, day) { return S.sched.filter(g => g.day === day && g.hs == null); }

function winPct(r) { return r.w + r.l ? r.w / (r.w + r.l) : 0; }
function standings(S, filter) {
  let ts = S.teams.slice();
  if (filter) ts = ts.filter(filter);
  return ts.sort((a, b) => (winPct(b.rec) - winPct(a.rec)) || ((b.rec.w - b.rec.l) - (a.rec.w - a.rec.l)) || ((b.rec.pf - b.rec.pa) - (a.rec.pf - a.rec.pa)));
}
function confSeeds(S, conf) {
  // division winners guaranteed top-3 seeds (2005 format)
  const conf_ = standings(S, t => t.conf === conf);
  const divWinners = [0, 1, 2].map(d => conf_.find(t => t.div === conf * 3 + d));
  const rest = conf_.filter(t => !divWinners.includes(t));
  const top = standings(S, t => divWinners.includes(t));
  return top.concat(rest);
}
function gamesBack(lead, t) { return ((lead.rec.w - t.rec.w) + (t.rec.l - lead.rec.l)) / 2; }

// rotation: balanced starting five then best available
function autoRotation(S, tid) {
  const t = S.teams[tid];
  const ps = roster(S, tid).filter(p => !p.inj || p.inj.games <= 0);
  const hurt = roster(S, tid).filter(p => p.inj && p.inj.games > 0);
  const by = U.sortBy(ps, p => p.ovr + (p.morale - 50) * 0.02);
  const start = [];
  const take = (fn) => { const p = by.find(x => !start.includes(x) && fn(x)); if (p) start.push(p); };
  take(p => p.pos === 'PG'); take(p => p.pos === 'SG' || p.pos === 'PG');
  take(p => p.pos === 'SF' || p.pos === 'SG'); take(p => p.pos === 'PF' || p.pos === 'SF'); take(p => p.pos === 'C' || p.pos === 'PF');
  // if a starter is much worse than the best bench player, swap by best fit
  for (let i = 0; i < start.length; i++) {
    const bench = by.filter(x => !start.includes(x));
    const cand = bench.find(x => Math.abs(POS_IDX[x.pos] - POS_IDX[start[i].pos]) <= 1 && x.ovr >= start[i].ovr + 5);
    if (cand) start[i] = cand;
  }
  while (start.length < 5 && by.length > start.length) take(() => true);
  const order = start.concat(by.filter(x => !start.includes(x))).concat(hurt);
  t.rot.order = order.map(p => p.pid);
  const plan = [35, 34, 33, 32, 31, 22, 19, 15, 11, 8, 0, 0, 0, 0, 0];
  t.rot.mins = {};
  order.forEach((p, i) => { t.rot.mins[p.pid] = (p.inj && p.inj.games > 0) ? 0 : (plan[i] || 0); });
  // stars play more
  const st = order[0]; if (st && st.ovr >= 86 && t.rot.mins[st.pid]) t.rot.mins[st.pid] = 37;
}

function ensureRotation(S, tid) {
  const t = S.teams[tid];
  if (t.autoRot || !isUser(S, tid)) { autoRotation(S, tid); return; }
  const ids = new Set(roster(S, tid).map(p => p.pid));
  t.rot.order = t.rot.order.filter(id => ids.has(id));
  for (const id of ids) if (!t.rot.order.includes(id)) { t.rot.order.push(id); t.rot.mins[id] = 0; }
  t.rot.saved = t.rot.saved || {};
  const isHurt = id => { const p = P(S, id); return p.inj && p.inj.games > 0; };
  // healed players get their old slot and minutes back
  for (const id of Object.keys(t.rot.saved).map(Number)) {
    const sv = t.rot.saved[id];
    if (!ids.has(id)) { delete t.rot.saved[id]; continue; }
    if (isHurt(id)) continue;
    if (sv.to != null && t.rot.mins[sv.to] != null) t.rot.mins[sv.to] = Math.max(0, t.rot.mins[sv.to] - sv.m);
    t.rot.mins[id] = sv.m;
    t.rot.order = t.rot.order.filter(x => x !== id);
    t.rot.order.splice(Math.min(sv.i, t.rot.order.length), 0, id);
    delete t.rot.saved[id];
  }
  const healthy = t.rot.order.filter(id => !isHurt(id));
  if (healthy.length >= 5) {
    const hurt = t.rot.order.filter(id => !healthy.includes(id));
    for (const id of hurt) {
      const m = t.rot.mins[id] || 0;
      if (m > 0) {
        const repl = healthy.find((h, i) => i >= 5 && (t.rot.mins[h] || 0) < 20) || healthy[5];
        if (repl != null) t.rot.mins[repl] = (t.rot.mins[repl] || 0) + m;
        if (!t.rot.saved[id]) t.rot.saved[id] = { i: t.rot.order.indexOf(id), m, to: repl != null ? repl : null };
        t.rot.mins[id] = 0;
      }
    }
    t.rot.order = healthy.concat(hurt);
  }
}

// ===== sim.js — possession-by-possession game engine =====
const SHOTS = {
  rim: { base: 0.617, k: 0.0058, kd: 0.0040, ast: 0.55, foul: 0.25, blk: 0.115, d: [0.5, 4] },
  close: { base: 0.398, k: 0.0054, kd: 0.0031, ast: 0.42, foul: 0.13, blk: 0.085, d: [4, 11] },
  mid: { base: 0.374, k: 0.0054, kd: 0.0027, ast: 0.54, foul: 0.038, blk: 0.02, d: [11, 22] },
  three: { base: 0.334, k: 0.0050, kd: 0.0025, ast: 0.84, foul: 0.012, blk: 0.01, d: [23.8, 26.5] },
};
const SIMK = { pace: [17.8, 15.6, 13.6], to: 0.150, nsf: 0.115, orb: 0.24, use: 2.85, drain: 0.00044, rec: 0.0011 };
const OFF_PLAYS = {
  balanced: { n: 'Balanced', d: 'Let the offense flow to the best look.' },
  pnr: { n: 'Pick & Roll', d: 'Guard-big action. More rim looks for bigs and pull-ups.' },
  iso: { n: 'Isolation', d: 'Clear out for your top scorer. Fewer assists.' },
  post: { n: 'Post Up', d: 'Pound it inside. Draws fouls, fewer threes.' },
  motion: { n: 'Motion', d: 'Ball movement. More assists, better looks, slower.' },
  three: { n: 'Spread & Fire', d: 'Five out. Hunt threes.' },
  push: { n: 'Push the Pace', d: 'Run on every possession. More rim attacks and risk.' },
};
const DEF_SCHEMES = {
  man: { n: 'Man-to-Man', d: 'Straight up. No gimmicks.' },
  zone: { n: '2-3 Zone', d: 'Protect the paint, concede threes and boards.' },
  press: { n: 'Full-Court Press', d: 'Force turnovers, burn energy, risk easy buckets.' },
  paint: { n: 'Pack the Paint', d: 'Sag off shooters, wall off the rim.' },
  deny: { n: 'Deny the Arc', d: 'Run shooters off the line, give up drives.' },
};
const PACES = ['Slow', 'Normal', 'Fast'];
const POS_TEND = { PG: [0.85, 0.42, 1.3, 0.75], SG: [0.9, 0.5, 1.4, 0.82], SF: [1.0, 0.75, 1.3, 0.6], PF: [1.1, 1.15, 1.1, 0.3], C: [1.3, 1.35, 0.68, 0.07] };
const ZONES = ['rim', 'close', 'mid', 'three'];

function comps(p) {
  const r = p.r, hb = 50 + (p.hgt - 79) * 4;
  return {
    rim: 0.55 * r.ins + 0.25 * r.jmp + 0.10 * r.str + 0.10 * hb, close: 0.62 * r.ins + 0.18 * r.str + 0.12 * r.iq + 0.08 * hb,
    mid: 0.85 * r.mid + 0.15 * r.iq, three: 0.92 * r.tpt + 0.08 * r.iq, ft: r.ft,
    create: 0.45 * r.bhd + 0.35 * r.spd + 0.20 * r.iq, pass: 0.75 * r.pas + 0.25 * r.iq, hand: 0.65 * r.bhd + 0.35 * r.iq,
    pdef: 0.6 * r.pdf + 0.25 * r.spd + 0.15 * r.iq, idef: 0.55 * r.idf + 0.2 * r.str + 0.15 * r.jmp + 0.10 * hb,
    blk: 0.7 * r.blk + 0.15 * r.jmp + 0.15 * hb, stl: 0.7 * r.stl + 0.3 * r.pdf,
    orb: 0.7 * r.orb + 0.15 * hb + 0.15 * r.jmp, drb: 0.7 * r.drb + 0.15 * hb + 0.15 * r.str,
  };
}

function newLine() { return { min: 0, pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, ftm: 0, fta: 0, orb: 0, drb: 0, ast: 0, stl: 0, blk: 0, tov: 0, pf: 0, pm: 0 }; }

class GameSim {
  constructor(S, g, opts = {}) {
    this.S = S; this.g = g; this.opts = opts;
    this.allStar = !!opts.allStar;
    this.T = [this.mkTeam(g.h, 0, opts.rosters && opts.rosters[0]), this.mkTeam(g.a, 1, opts.rosters && opts.rosters[1])];
    this.q = 1; this.clock = 720; this.score = [0, 0]; this.qs = [[0], [0]];
    this.done = false; this.ev = []; this.log = []; this.fb = false; this.dead = true;
    this.run = { side: -1, pts: 0 }; this.elapsed = 0; this.shots = [];
    this.tip = U.chance(0.5) ? 0 : 1; this.pos = this.tip;
    this.injuries = [];
    this.zm = [{ rim: 0, close: 0, mid: 0, three: 0 }, { rim: 0, close: 0, mid: 0, three: 0 }];
    this.live = !!opts.live;
    this.userSide = opts.userSide != null ? opts.userSide : -1;
    this.homeAdv = this.allStar ? 0 : 0.022 + (this.S.teams[g.h] ? this.S.teams[g.h].arena.up.fan * 0.002 : 0);
    this.say(0, 'tip', `Tip-off. ${this.T[this.tip].abbr} win the jump ball.`);
  }
  mkTeam(tid, side, custom) {
    const S = this.S;
    const t = tid >= 0 ? S.teams[tid] : null;
    let ps;
    if (custom) ps = custom.pids.map(id => P(S, id));
    else {
      ensureRotation(S, tid);
      ps = t.rot.order.map(id => P(S, id)).filter(p => p && p.tid === tid && (!p.inj || p.inj.games <= 0));
      if (ps.length < 5) ps = ps.concat(roster(S, tid).filter(p => !ps.includes(p))).slice(0, 5);
    }
    const mins = custom ? custom.mins : t.rot.mins;
    let tot = U.sum(ps, p => mins[p.pid] || 0);
    const scale = tot > 0 ? 240 / tot : 1;
    const hc = t ? t.staff.hc : { r: { off: 60, def: 60, mot: 60 } };
    const gps = ps.map((p, i) => {
      const c = comps(p);
      const mor = this.allStar ? 0 : (p.morale - 60) * 0.25;
      for (const k in c) c[k] += mor * 0.2 + (k === 'pdef' || k === 'idef' ? (this.allStar ? -12 : 0) : 0);
      const tw = POS_TEND[p.pos];
      let tend = [Math.pow(c.rim / 55, 2) * tw[0], Math.pow(c.close / 55, 2) * tw[1], Math.pow(c.mid / 55, 2) * tw[2], Math.pow(Math.max(10, p.r.tpt) / 55, 3.2) * tw[3]];
      const ts = U.sum(tend); tend = tend.map(x => x / ts);
      const off = (tend[0] * c.rim + tend[1] * c.close + tend[2] * c.mid + tend[3] * c.three) * 0.72 + c.create * 0.28;
      let use = Math.pow(off / 55, SIMK.use) * (p.pers === 'diva' ? 1.08 : 1);
      return { p, pid: p.pid, c, tend, use, energy: 1, on: false, st: newLine(), fouls: 0, out: false, tgt: Math.min(44, (mins[p.pid] || 0) * scale), pi: POS_IDX[p.pos], starter: i < 5 };
    });
    gps.slice(0, 5).forEach(x => x.on = true);
    return {
      tid, side, t, abbr: t ? t.abbr : (custom && custom.abbr), name: t ? t.name : (custom && custom.name), ps: gps,
      strat: t ? Object.assign({}, t.strat) : { off: 'balanced', def: 'man', pace: 2 }, play: 'balanced', feed: null,
      tos: 7, qf: 0, auto: true, hc,
    };
  }
  on(side) { return this.T[side].ps.filter(x => x.on); }
  fat(g) { return 0.78 + 0.22 * g.energy; }
  say(side, type, text, extra) {
    const e = Object.assign({ type, side, text, q: this.q, clk: this.clock, sc: this.score.slice() }, extra || {});
    this.ev.push(e); this.log.push(e);
    return e;
  }
  clockStr() { const c = Math.max(0, this.clock); const m = Math.floor(c / 60), s = Math.floor(c % 60); return m + ':' + String(s).padStart(2, '0'); }

  // ---------- public controls ----------
  setPlay(side, play) { this.T[side].strat.off = play; }
  setDef(side, d) { this.T[side].strat.def = d; }
  setPace(side, p) { this.T[side].strat.pace = p; }
  timeout(side) {
    const T = this.T[side];
    if (T.tos <= 0 || this.done) return false;
    T.tos--;
    for (const s of [0, 1]) for (const g of this.on(s)) g.energy = Math.min(1, g.energy + 0.05);
    this.run = { side: -1, pts: 0 }; this.dead = true;
    this.say(side, 'timeout', `Timeout ${T.abbr}. (${T.tos} left)`);
    this.aiAdjust(side);
    return true;
  }
  sub(side, outPid, inPid) {
    const T = this.T[side];
    const o = T.ps.find(x => x.pid === outPid), i = T.ps.find(x => x.pid === inPid);
    if (!o || !i || !o.on || i.on || i.out) return false;
    o.on = false; i.on = true;
    this.say(side, 'sub', `${T.abbr} sub: ${pshort(i.p)} in for ${pshort(o.p)}`, { pin: inPid, pout: outPid });
    return true;
  }

  // ---------- engine ----------
  step() {
    this.ev = [];
    if (this.done) return this.ev;
    if (this.dead) { this.autoSubs(0); this.autoSubs(1); this.aiTimeouts(); }
    this.possession();
    if (this.clock <= 0.01) this.endPeriod();
    return this.ev;
  }
  simToEnd() { let n = 0; while (!this.done && n++ < 2000) this.step(); return this; }
  simToPeriodEnd() { const q = this.q; let n = 0; while (!this.done && this.q === q && n++ < 400) this.step(); }

  advance(dt) {
    dt = Math.min(dt, this.clock);
    if (dt <= 0) return;
    this.clock -= dt; this.elapsed += dt;
    for (const s of [0, 1]) {
      const T = this.T[s], O = this.T[1 - s];
      const mult = (T.strat.pace === 2 ? 1.1 : T.strat.pace === 0 ? 0.92 : 1) * (T.strat.def === 'press' ? 1.35 : 1) * (this.allStar ? 0.7 : 1);
      for (const g of T.ps) {
        if (g.on) {
          g.st.min += dt / 60;
          g.energy = Math.max(0.35, g.energy - dt * SIMK.drain * (1.55 - g.p.r.sta / 100) * mult);
          if (this.S.settings.injuries && !this.allStar && !g.out) {
            const med = T.t ? T.t.arena.up.med : 0;
            const tr = T.t ? T.t.staff.trainer.r.cond : 60;
            const pInj = (dt / 60) * 0.00050 * ((112 - g.p.r.dur) / 45) * (1 - med * 0.07) * (1.15 - tr / 200) * (1.3 - g.energy * 0.3);
            if (Math.random() < pInj) this.injure(s, g);
          }
        } else g.energy = Math.min(1, g.energy + dt * SIMK.rec);
      }
    }
  }
  injure(side, g) {
    const inj = U.wpick(INJURIES, x => x[4] != null ? x[4] : x[3]);
    let games = U.ri(inj[1], inj[2]);
    const T = this.T[side];
    if (T.t) games = Math.max(1, Math.round(games * (1.1 - T.t.staff.trainer.r.med / 250) * (1 - T.t.arena.up.med * 0.06)));
    g.out = true; g.injury = { type: inj[0], games };
    this.injuries.push({ pid: g.pid, type: inj[0], games });
    this.say(side, 'inj', `${pshort(g.p)} (${T.abbr}) is hurt — ${inj[0]}. He will not return.`, { pid: g.pid });
    if (g.on) this.forceSub(side, g);
  }
  forceSub(side, g) {
    const T = this.T[side];
    g.on = false;
    const bench = T.ps.filter(x => !x.on && !x.out);
    if (!bench.length) { g.on = !g.out; return; }
    const rep = U.maxBy(bench, x => -Math.abs(x.pi - g.pi) * 0.6 + x.energy + x.tgt / 30 + x.p.ovr / 60);
    rep.on = true;
    this.say(side, 'sub', `${T.abbr} sub: ${pshort(rep.p)} in for ${pshort(g.p)}`, { pin: rep.pid, pout: g.pid });
  }
  regMinLeft() { return this.q <= 4 ? (4 - this.q) * 12 + this.clock / 60 : this.clock / 60; }
  autoSubs(side) {
    const T = this.T[side];
    if (!T.auto) return;
    const remain = Math.max(1.5, this.regMinLeft());
    const diff = this.score[side] - this.score[1 - side];
    const late = this.q >= 4 && this.clock < 300 && Math.abs(diff) <= 10;
    const garbage = this.q >= 4 && this.clock < 420 && Math.abs(diff) >= 18;
    const flim = [0, 2, 3, 4, 5, 5][Math.min(5, this.q)];
    const score = g => {
      if (g.out) return -99;
      let need = U.clamp((g.tgt - g.st.min) / remain, -1.5, 1.5);
      let s = need + 3.0 * (g.energy - 0.88);
      if (g.fouls >= flim && !(late && g.fouls < 6)) s -= 0.7;
      if (late) s += g.tgt / 40;
      if (garbage) s += g.tgt >= 26 ? -1.2 : g.tgt <= 10 ? 0.5 : 0;
      if (this.q > 4) s += g.tgt / 30;
      return s;
    };
    const court = this.on(side).sort((a, b) => score(a) - score(b));
    let swaps = 0;
    for (const c of court) {
      if (swaps >= 3) break;
      const cs = score(c);
      const bench = T.ps.filter(x => !x.on && !x.out);
      let best = null, bv = -99;
      for (const b of bench) {
        const pd = Math.abs(b.pi - c.pi);
        if (pd > 2) continue;
        const v = score(b) - pd * 0.12;
        if (v > bv) { bv = v; best = b; }
      }
      if (best && bv > cs + 0.18) {
        c.on = false; best.on = true; swaps++;
        this.say(side, 'sub', `${T.abbr} sub: ${pshort(best.p)} in for ${pshort(c.p)}`, { pin: best.pid, pout: c.pid, quiet: true });
      }
    }
    // keep someone who can handle the ball, and a big
    const on = this.on(side);
    const fix = (test, want) => {
      if (on.some(test)) return;
      const b = T.ps.filter(x => !x.on && !x.out && test(x)).sort((a, b) => b.energy - a.energy)[0];
      const c = on.filter(x => !test(x)).sort((a, b) => score(a) - score(b))[0];
      if (b && c) { c.on = false; b.on = true; this.say(side, 'sub', `${T.abbr} sub: ${pshort(b.p)} in for ${pshort(c.p)}`, { pin: b.pid, pout: c.pid, quiet: true }); }
    };
    fix(g => g.pi <= 1, 'guard'); fix(g => g.pi >= 3, 'big');
  }
  // live games: the AI coach reacts to how the game is going
  aiAdjust(s) {
    if (!this.live || s === this.userSide || this.allStar) return;
    const T = this.T[s], O = this.T[1 - s];
    const diff = this.score[s] - this.score[1 - s];
    const z = this.zm[1 - s], tot = z.rim + z.close + z.mid + z.three || 1;
    let def = T.t ? T.t.strat.def : 'man', off = 'balanced';
    if (z.three / tot > 0.42) def = 'deny';
    else if ((z.rim + z.close) / tot > 0.6) def = Math.random() < 0.5 ? 'paint' : 'zone';
    if (diff <= -12 && this.q >= 3) { def = 'press'; off = 'three'; }
    else if (diff <= -6) off = U.pick(['pnr', 'push', 'three']);
    else if (diff >= 10 && this.q >= 4) off = 'motion';
    else { const star = U.maxBy(this.on(s), g => g.st.pts); off = star && star.st.pts >= 6 + this.q * 5 ? 'iso' : U.pick(['balanced', 'balanced', 'pnr', 'motion', 'post']); }
    const msgs = [];
    if (def !== T.strat.def) { T.strat.def = def; msgs.push(DEF_SCHEMES[def].n); }
    if (off !== T.strat.off) { T.strat.off = off; msgs.push(OFF_PLAYS[off].n); }
    if (msgs.length) this.say(s, 'adjust', `${T.abbr} adjust: ${msgs.join(', ')}.`);
  }
  aiTimeouts() {
    for (const s of [0, 1]) {
      if (s === this.userSide) continue;
      if (this.run.side === 1 - s && this.run.pts >= 8 && this.T[s].tos > 1 && Math.random() < 0.7) this.timeout(s);
      else if (this.q >= 4 && this.clock < 40 && this.T[s].tos > 0 && Math.abs(this.score[0] - this.score[1]) <= 3 && Math.random() < 0.25 && this.pos === s) this.timeout(s);
    }
  }
  matchup(side, g) {
    const o = this.on(side).sort((a, b) => a.pi - b.pi), d = this.on(1 - side).sort((a, b) => a.pi - b.pi);
    return d[Math.max(0, o.indexOf(g))] || d[0];
  }
  pickShooter(O) {
    const on = this.on(O.side);
    const play = O.strat.off;
    const maxUse = Math.max(...on.map(g => g.use));
    return U.wpick(on, g => {
      let w = g.use * Math.pow(this.fat(g), 2);
      if (play === 'iso' && g.use === maxUse) w *= 1.7;
      if (play === 'pnr') w *= g.pi <= 1 ? 1.45 : g.pi >= 3 ? 1.25 : 0.8;
      if (play === 'post') w *= g.pi >= 3 ? 1.9 : g.pi === 2 ? 1 : 0.65;
      if (play === 'three') w *= Math.pow(g.p.r.tpt / 60, 2.2);
      if (play === 'motion') w = Math.pow(w, 0.6);
      if (O.feed === g.pid) w *= 2.0;
      if (g.st.fga > 18) w *= Math.max(0.45, 1 - (g.st.fga - 18) * 0.035);
      return w;
    });
  }
  pickType(g, O, D, trail3) {
    const play = O.strat.off, def = D.strat.def;
    const w = g.tend.slice();
    const m = [1, 1, 1, 1];
    if (play === 'pnr') { if (g.pi >= 3) m[0] *= 1.35; else m[2] *= 1.2; }
    if (play === 'iso') { m[2] *= 1.25; m[1] *= 1.1; }
    if (play === 'post') { m[1] *= 1.7; m[0] *= 1.15; m[3] *= 0.55; }
    if (play === 'three') { m[3] *= 1.65; m[2] *= 0.8; }
    if (play === 'push') { m[0] *= 1.3; m[3] *= 1.05; }
    if (play === 'motion') { m[3] *= 1.12; m[1] *= 1.05; }
    if (def === 'zone') { m[3] *= 1.28; m[0] *= 0.85; m[1] *= 0.9; }
    if (def === 'paint') { m[0] *= 0.8; m[1] *= 0.85; m[3] *= 1.22; }
    if (def === 'deny') { m[3] *= 0.72; m[0] *= 1.18; }
    if (def === 'press') { m[0] *= 1.1; }
    if (trail3) m[3] *= 5;
    if (this.fb) { m[0] *= 4; m[1] *= 0.5; m[2] *= 0.6; }
    const ws = w.map((x, i) => x * m[i]);
    return U.wpick([0, 1, 2, 3], i => ws[i]);
  }
  defValue(D, shooter, defender, zone) {
    const on = this.on(D.side);
    const f = g => this.fat(g);
    const bigs = shooter.pi >= 3;
    if (zone === 'rim') return 0.45 * (bigs ? defender.c.idef : defender.c.pdef) * f(defender) + 0.55 * Math.max(...on.map(g => g.c.idef * f(g)));
    if (zone === 'close') return 0.6 * defender.c.idef * f(defender) + 0.4 * Math.max(...on.map(g => g.c.idef * f(g)));
    if (zone === 'mid') return 0.8 * defender.c.pdef * f(defender) + 0.2 * U.avg(on, g => g.c.pdef * f(g));
    return 0.85 * defender.c.pdef * f(defender) + 0.15 * U.avg(on, g => g.c.pdef * f(g));
  }
  coachMod(O, D) { return ((O.hc.r.off - 55) - (D.hc.r.def - 55)) * 0.00035; }
  boost(side) {
    if (this.allStar) return 0;
    const df = DIFFS[this.S.diff] || DIFFS[1];
    const u = this.S.user;
    if (this.T[side].tid === u) return df.boost;
    if (this.T[1 - side].tid === u) return -df.boost * 0.5;
    return 0;
  }

  possession() {
    const o = this.pos, d = 1 - o, O = this.T[o], D = this.T[d];
    const diff = this.score[o] - this.score[d];
    const lateQ = this.q >= 4;
    // intentional fouling when trailing late
    if (lateQ && this.clock <= 50 && this.clock > 2 && diff > 0 && diff <= 8 && !this.allStar && Math.random() < 0.85) {
      this.advance(U.rf(1.5, 5));
      const fouler = U.wpick(this.on(d), g => (6 - g.fouls) * (100 - g.p.ovr + 10));
      const ft = U.wpick(this.on(o), g => Math.pow(g.c.ft, 4));
      this.addFoul(d, fouler, `${pshort(fouler.p)} fouls ${pshort(ft.p)} intentionally to stop the clock`);
      this.dead = true;
      this.freeThrows(o, ft, 2);
      return;
    }
    // possession length
    let pace = SIMK.pace[O.strat.pace];
    if (O.strat.off === 'push') pace -= 2.2; if (O.strat.off === 'motion') pace += 1.3;
    if (D.strat.def === 'press') pace -= 1.4; if (D.strat.def === 'zone') pace += 0.6;
    if (this.allStar) pace -= 2.5;
    let dur = this.fb ? U.rf(3.5, 7) : U.clamp(U.gauss(pace, 4.2), 4, 23.5);
    let trail3 = false;
    if (lateQ && this.clock <= 60 && diff > 0) dur = Math.max(dur, U.rf(16, 23));
    if (lateQ && this.clock <= 35 && diff < 0) { dur = Math.min(dur, U.rf(3, 8)); if (diff <= -3) trail3 = true; }
    if (this.q < 4 && this.clock <= 26 && this.clock > dur) { if (Math.random() < 0.7) dur = this.clock - U.rf(0.3, 2.5); }
    let heave = false;
    if (dur >= this.clock) { if (this.clock < 2.5 && Math.random() < 0.85) heave = true; dur = this.clock; }
    this.advance(dur);
    // turnover
    const onO = this.on(o), onD = this.on(d);
    const offHand = U.avg(onO, g => g.c.hand * this.fat(g));
    const defStl = U.avg(onD, g => g.c.stl * this.fat(g));
    let pTO = SIMK.to * Math.pow(55 / offHand, 0.9) * Math.pow(defStl / 52, 0.9);
    if (D.strat.def === 'press') pTO += 0.03; if (O.strat.off === 'push') pTO += 0.015; if (O.strat.off === 'iso') pTO += 0.004;
    if (this.fb) pTO *= 0.7; if (this.allStar) pTO *= 0.85; if (heave) pTO = 0;
    this.fb = false;
    if (Math.random() < pTO) { this.turnover(o, d, defStl, dur); return; }
    // non-shooting foul
    let pN = SIMK.nsf + (D.strat.def === 'press' ? 0.02 : 0) + (O.strat.off === 'post' ? 0.012 : 0);
    if (!heave && Math.random() < pN) {
      const fouler = U.wpick(onD, g => 1.3 - g.c.pdef / 120 + (g.pi >= 3 ? 0.2 : 0));
      const vic = U.wpick(onO, g => g.use);
      D.qf++;
      this.addFoul(d, fouler, `Foul on ${pshort(fouler.p)}${D.qf >= 5 ? ' — in the penalty' : ''}`);
      if (D.qf >= 5) { this.dead = true; this.freeThrows(o, vic, 2); return; }
    }
    // shot(s), with offensive rebounds
    let shooter = this.pickShooter(O), putback = false;
    for (let att = 0; att < 6; att++) {
      const zi = putback ? (Math.random() < 0.65 ? 0 : 1) : heave ? 3 : this.pickType(shooter, O, D, trail3);
      const res = this.shoot(O, D, shooter, ZONES[zi], heave, putback);
      if (res !== 'oreb') return;
      // offensive rebound
      if (this.clock <= 0.05) return;
      const rb = this.lastReb;
      putback = Math.random() < 0.38 && rb.pi >= 2;
      shooter = putback ? rb : this.pickShooter(O);
      const t2 = putback ? U.rf(1, 3) : U.rf(4, 11);
      if (t2 >= this.clock) { this.advance(this.clock); heave = false; putback = true; shooter = rb; } else this.advance(t2);
    }
  }
  turnover(o, d, defStl, dur) {
    const O = this.T[o], D = this.T[d];
    const onO = this.on(o), onD = this.on(d);
    const g = U.wpick(onO, x => x.use * Math.pow(70 / Math.max(25, x.c.hand), 1.5));
    g.st.tov++;
    let stealP = 0.52 * Math.pow(defStl / 52, 0.7) + (D.strat.def === 'press' ? 0.08 : 0);
    if (Math.random() < stealP) {
      const s = U.wpick(onD, x => Math.pow(x.c.stl, 3));
      s.st.stl++;
      this.say(o, 'tov', `${pshort(s.p)} picks off ${pshort(g.p)}!`, { pid: g.pid, by: s.pid, steal: true });
      this.fb = Math.random() < (0.5 + (D.strat.pace === 2 ? 0.1 : 0));
      this.dead = false;
    } else {
      const r = Math.random();
      if (r < 0.14) { g.fouls++; g.st.pf++; this.say(o, 'tov', `Offensive foul on ${pshort(g.p)}.`, { pid: g.pid }); this.checkFoulOut(o, g); }
      else if (dur > 21.5) this.say(o, 'tov', `Shot clock violation on ${O.abbr}.`, { pid: g.pid });
      else this.say(o, 'tov', U.pick([`${pshort(g.p)} throws it away.`, `${pshort(g.p)} loses the handle out of bounds.`, `Traveling on ${pshort(g.p)}.`, `${pshort(g.p)} steps out of bounds.`, `Bad pass by ${pshort(g.p)}.`]), { pid: g.pid });
      this.dead = true;
    }
    this.pos = d;
  }
  addFoul(side, g, text) {
    g.fouls++; g.st.pf++;
    this.say(side, 'foul', text + ` (${g.fouls} PF)`, { pid: g.pid });
    this.checkFoulOut(side, g);
  }
  checkFoulOut(side, g) {
    if (g.fouls >= 6 && !this.allStar) { g.out = true; this.say(side, 'foulout', `${pshort(g.p)} has fouled out.`, { pid: g.pid }); if (g.on) this.forceSub(side, g); }
  }
  shotSpot(zone, heave) {
    let dist, ang = U.rf(-1.35, 1.35);
    if (heave) dist = U.rf(30, 60);
    else if (zone === 'three') {
      if (Math.abs(ang) > 1.15 && Math.random() < 0.6) { const x = (ang > 0 ? 1 : -1) * U.rf(22, 23); return { x, y: U.rf(1, 9), dist: 22 + U.rf(0, 1) }; }
      dist = U.rf(23.8, 23.8 + (Math.random() < 0.15 ? 5 : 2.5));
    } else { const [a, b] = SHOTS[zone].d; dist = U.rf(a, b); }
    let x = Math.sin(ang) * dist, y = 5.25 + Math.cos(ang) * dist;
    if (y < 1) y = 1;
    return { x, y, dist };
  }
  shoot(O, D, g, zone, heave, putback) {
    const o = O.side, d = D.side;
    const sh = SHOTS[zone];
    const defender = this.matchup(o, g);
    const spot = this.shotSpot(zone, heave);
    const skill = g.c[zone] * this.fat(g);
    const dv = this.defValue(D, g, defender, zone);
    let p = sh.base + sh.k * (skill - 58) - sh.kd * (dv - 55);
    p += (o === 0 ? this.homeAdv : -this.homeAdv * 0.3) + this.coachMod(O, D) + this.boost(o);
    if (O.strat.off === 'motion') p += 0.008;
    if (g.st.fga > 16) p -= (g.st.fga - 16) * 0.005;
    g.energy = Math.max(0.35, g.energy - 0.0015); if (this.fb && zone === 'rim') p += 0.06; if (putback) p += 0.04;
    const ds = D.strat.def;
    if (ds === 'zone') { if (zone === 'rim' || zone === 'close') p -= 0.025; if (zone === 'three') p += 0.012; }
    if (ds === 'paint') { if (zone === 'rim' || zone === 'close') p -= 0.035; if (zone === 'three' || zone === 'mid') p += 0.015; }
    if (ds === 'deny') { if (zone === 'three') p -= 0.03; if (zone === 'rim') p += 0.02; }
    if (ds === 'press' && zone === 'rim') p += 0.02;
    if (zone === 'three') p -= Math.max(0, spot.dist - 24.5) * 0.012;
    if (heave) p = spot.dist > 40 ? 0.02 : 0.07;
    if (this.allStar) p += zone === 'rim' ? 0.06 : 0.02;
    p = U.clamp(p, 0.02, 0.88);
    // block
    const onD = this.on(d);
    const blocker = U.wpick(onD, x => Math.pow(x.c.blk, 3) * (x === defender ? 2 : 1));
    const pB = heave ? 0.01 : sh.blk * Math.pow(blocker.c.blk * this.fat(blocker) / 60, 2.2) * (this.allStar ? 0.5 : 1);
    // shooting foul
    let pF = heave ? 0.005 : sh.foul * Math.pow(g.c.create / 60, 0.4) * (O.strat.off === 'post' ? 1.2 : 1) * (this.allStar ? 0.4 : 1);
    const fouled = Math.random() < pF;
    const pts = zone === 'three' ? 3 : 2;
    const info = { pid: g.pid, zone, x: spot.x, y: spot.y, dist: Math.round(spot.dist), pts };
    if (!fouled && Math.random() < pB) {
      g.st.fga++; if (pts === 3) g.st.tpa++; blocker.st.blk++;
      this.shots.push({ side: o, pid: g.pid, x: spot.x, y: spot.y, made: 0, z: zone });
      this.say(o, 'shot', `${pshort(g.p)} ${zone === 'three' ? 'three' : 'shot'} — REJECTED by ${pshort(blocker.p)}!`, Object.assign(info, { made: false, blk: blocker.pid }));
      return this.rebound(O, D, zone, true);
    }
    const made = Math.random() < (fouled ? p * 0.42 : p);
    if (fouled) {
      const fd = Math.random() < 0.75 ? defender : U.pick(onD);
      fd.fouls++; fd.st.pf++; D.qf++;
      if (made) {
        this.made(O, D, g, zone, pts, info, spot, true);
        this.say(d, 'foul', `And one! Foul on ${pshort(fd.p)} (${fd.fouls} PF)`, { pid: fd.pid });
        this.checkFoulOut(d, fd);
        this.freeThrows(o, g, 1);
      } else {
        this.say(d, 'foul', `${pshort(g.p)} fouled on the ${zone === 'three' ? 'three' : 'shot'} by ${pshort(fd.p)} (${fd.fouls} PF)`, { pid: fd.pid });
        this.checkFoulOut(d, fd);
        this.freeThrows(o, g, pts);
      }
      return 'done';
    }
    if (made) { this.made(O, D, g, zone, pts, info, spot, false); return 'done'; }
    g.st.fga++; if (pts === 3) g.st.tpa++;
    this.shots.push({ side: o, pid: g.pid, x: spot.x, y: spot.y, made: 0, z: zone });
    this.say(o, 'shot', shotText(g, zone, false, Math.round(spot.dist), null, heave), Object.assign(info, { made: false }));
    return this.rebound(O, D, zone, false);
  }
  made(O, D, g, zone, pts, info, spot, andOne) {
    const o = O.side;
    g.st.fga++; g.st.fgm++; g.st.pts += pts; if (pts === 3) { g.st.tpa++; g.st.tpm++; }
    const others = this.on(o).filter(x => x !== g);
    const passAvg = U.avg(others, x => x.c.pass);
    let pA = SHOTS[zone].ast * Math.pow(passAvg / 55, 0.6);
    if (O.strat.off === 'motion') pA *= 1.15; if (O.strat.off === 'iso') pA *= 0.62; if (O.strat.off === 'pnr') pA *= 1.08;
    if (this.allStar) pA *= 1.15;
    let ast = null;
    if (Math.random() < pA) { ast = U.wpick(others, x => Math.pow(x.c.pass, 3.6) * (x.pi === 0 ? 1.35 : 1)); ast.st.ast++; }
    const before = this.score[o] - this.score[1 - o];
    this.zm[o][zone] += pts;
    this.addPts(o, pts);
    if (this.q >= 4 && this.clock <= 1.5 && before <= 0 && before + pts > 0) this.walkoff = g.pid;
    this.shots.push({ side: o, pid: g.pid, x: spot.x, y: spot.y, made: 1, z: zone });
    this.say(o, 'shot', shotText(g, zone, true, Math.round(spot.dist), ast, false, this.fb) + (ast ? ` (${pshort(ast.p)} assists)` : ''), Object.assign(info, { made: true, ast: ast ? ast.pid : null }));
    this.dead = true;
    if (!andOne) this.pos = D.side;
  }
  addPts(side, pts) {
    if (this.walkoff && !this.T[side].ps.some(x => x.pid === this.walkoff)) this.walkoff = null;
    this.score[side] += pts;
    const qi = this.q - 1;
    this.qs[side][qi] = (this.qs[side][qi] || 0) + pts;
    for (const g of this.on(side)) g.st.pm += pts;
    for (const g of this.on(1 - side)) g.st.pm -= pts;
    if (this.run.side === side) this.run.pts += pts; else this.run = { side, pts };
  }
  rebound(O, D, zone, blocked) {
    const onO = this.on(O.side), onD = this.on(D.side);
    const oR = U.avg(onO, g => g.c.orb * this.fat(g)), dR = U.avg(onD, g => g.c.drb * this.fat(g));
    let pOR = SIMK.orb * Math.pow((oR / dR) / 0.86, 1.6);
    if (zone === 'three') pOR += 0.02; if (zone === 'rim') pOR += 0.015;
    if (D.strat.def === 'zone') pOR += 0.025; if (O.strat.off === 'push') pOR -= 0.02; if (O.strat.off === 'three') pOR -= 0.015;
    if (blocked) pOR += 0.04;
    pOR = U.clamp(pOR, 0.08, 0.5);
    if (Math.random() < pOR) {
      const rb = U.wpick(onO, g => Math.pow(g.c.orb, 2.0) * (g.pi >= 3 ? 1.15 : 1));
      rb.st.orb++; this.lastReb = rb;
      this.say(O.side, 'reb', `Offensive board, ${pshort(rb.p)}.`, { pid: rb.pid, off: true });
      return 'oreb';
    }
    const rb = U.wpick(onD, g => Math.pow(g.c.drb, 2.0) * (g.pi >= 3 ? 1.12 : 1));
    rb.st.drb++;
    this.say(D.side, 'reb', `${pshort(rb.p)} rebounds.`, { pid: rb.pid, off: false });
    this.fb = Math.random() < (0.1 + (D.strat.pace === 2 ? 0.07 : 0) + (D.strat.off === 'push' ? 0.1 : 0));
    this.dead = false;
    this.pos = D.side;
    return 'done';
  }
  freeThrows(side, g, n) {
    const T = this.T[side];
    let made = 0;
    for (let i = 0; i < n; i++) {
      let p = 0.27 + 0.0066 * g.c.ft * (0.9 + 0.1 * g.energy);
      if (this.allStar) p += 0.03;
      p = U.clamp(p, 0.3, 0.95);
      g.st.fta++;
      if (Math.random() < p) { g.st.ftm++; g.st.pts++; made++; this.addPts(side, 1); }
    }
    this.say(side, 'ft', `${pshort(g.p)} ${made}/${n} at the line.`, { pid: g.pid, made, n });
    if (made === n || n === 0) { this.pos = 1 - side; this.dead = true; return; }
    // missed last free throw: live rebound
    const O = this.T[side], D = this.T[1 - side];
    if (Math.random() < 0.14) {
      const rb = U.wpick(this.on(side), x => Math.pow(x.c.orb, 3)); rb.st.orb++;
      this.say(side, 'reb', `Offensive board, ${pshort(rb.p)}.`, { pid: rb.pid, off: true });
      this.pos = side; this.dead = false;
    } else {
      const rb = U.wpick(this.on(1 - side), x => Math.pow(x.c.drb, 3)); rb.st.drb++;
      this.say(1 - side, 'reb', `${pshort(rb.p)} rebounds.`, { pid: rb.pid, off: false });
      this.pos = 1 - side; this.dead = false;
    }
  }
  endPeriod() {
    const q = this.q;
    if (q >= 4 && this.score[0] !== this.score[1]) {
      this.done = true;
      if (this.walkoff && this.T[this.score[0] > this.score[1] ? 0 : 1].ps.every(x => x.pid !== this.walkoff)) this.walkoff = null;
      if (this.walkoff && this.clock > 0.01) this.walkoff = null;
      this.say(this.score[0] > this.score[1] ? 0 : 1, 'final', `Final${q > 4 ? (q === 5 ? '/OT' : '/' + (q - 4) + 'OT') : ''}: ${this.T[0].abbr} ${this.score[0]}, ${this.T[1].abbr} ${this.score[1]}`);
      return;
    }
    this.say(-1, 'period', q <= 4 ? `End of ${U.ord(q)} quarter: ${this.T[0].abbr} ${this.score[0]}, ${this.T[1].abbr} ${this.score[1]}` : `End of overtime: ${this.score[0]}-${this.score[1]}`);
    this.q++;
    this.clock = this.q <= 4 ? 720 : 300;
    for (const s of [0, 1]) {
      this.T[s].qf = 0; this.qs[s][this.q - 1] = 0;
      if (this.q === 3) this.T[s].tos = Math.max(this.T[s].tos, 4);
      if (this.q === 5) this.T[s].tos = Math.max(this.T[s].tos, 2);
      for (const g of this.T[s].ps) g.energy = Math.min(1, g.energy + (this.q === 3 ? 0.22 : 0.07));
    }
    this.pos = this.q === 2 || this.q === 3 ? 1 - this.tip : this.q === 4 ? this.tip : (U.chance(0.5) ? 0 : 1);
    this.aiAdjust(0); this.aiAdjust(1);
    this.dead = true; this.fb = false;
    this.say(-1, 'period', this.q <= 4 ? `Start of the ${U.ord(this.q)} quarter.` : 'Overtime!');
  }
  box() {
    return {
      gid: this.g.gid, q: this.q, ot: Math.max(0, this.q - 4), score: this.score.slice(), qs: this.qs.map(a => a.slice()),
      teams: this.T.map(T => ({
        tid: T.tid, abbr: T.abbr,
        ps: T.ps.filter(g => g.st.min > 0 || g.starter).map(g => Object.assign({ pid: g.pid, n: pshort(g.p), pos: g.p.pos, gs: g.starter ? 1 : 0 }, roundLine(g.st))),
      })),
      shots: this.shots,
    };
  }
}
function roundLine(st) { const o = Object.assign({}, st); o.min = Math.round(st.min * 10) / 10; return o; }

function shotText(g, zone, made, dist, ast, heave, fb) {
  const n = pshort(g.p);
  const dunker = g.p.r.jmp >= 70 || (g.pi >= 3 && g.p.r.str >= 70);
  if (heave) return made ? `${n} launches from ${dist} feet... BANG! At the buzzer!` : `${n} heaves from ${dist} feet — no good.`;
  if (zone === 'rim') {
    if (made) {
      if (fb) return U.pick([`${n} leaks out and finishes the break`, `${n} all alone — easy two in transition`, dunker ? `${n} throws it down on the break!` : `${n} lays it in on the break`]);
      if (dunker && Math.random() < 0.45) return ast && Math.random() < 0.4 ? `${n} finishes the alley-oop!` : U.pick([`${n} rises and SLAMS it home`, `${n} with a thunderous dunk`, `${n} throws down a two-hand jam`, `${n} hammers it in traffic`]);
      return U.pick([`${n} drives and lays it in`, `${n} finishes at the rim`, `${n} scoops in a reverse layup`, `${n} goes glass on the drive`, `${n} converts the layup`, `${n} finishes through contact`]);
    }
    return U.pick([`${n} misses the layup`, `${n} can't finish at the rim`, `${n} rolls the layup off the iron`, dunker ? `${n} hammers the dunk off the back iron` : `${n} misses in traffic`]);
  }
  if (zone === 'close') {
    if (made) return U.pick([`${n} drops in a hook shot`, `${n} banks in a floater`, `${n} turnaround in the post — good`, `${n} drop step and scores`, `${n} runner in the lane`, `${n} spins baseline and hits`]);
    return U.pick([`${n} misses the hook`, `${n} floater rims out`, `${n} turnaround is short`, `${n} misses from ${dist} feet`]);
  }
  if (zone === 'mid') {
    if (made) return U.pick([`${n} pull-up jumper from ${dist} — good`, `${n} hits the ${dist}-foot fadeaway`, `${n} knocks down the elbow jumper`, `${n} buries the baseline J from ${dist}`, `${n} step-back from ${dist} — got it`]);
    return U.pick([`${n} misses a ${dist}-footer`, `${n} pull-up rattles out`, `${n} fadeaway is off`, `${n} long two — no good`]);
  }
  if (made) return U.pick([`${n} drains a ${dist}-footer from deep`, `${n} — THREE! Got it!`, `${n} buries the triple`, `${n} splashes the three from ${dist}`, dist <= 22 ? `${n} corner three is good` : `${n} step-back three — money`]);
  return U.pick([`${n} misses from downtown`, `${n} three-point try is off`, `${n} long three rims out`, `${n} airballs from ${dist}`.replace('airballs', Math.random() < 0.1 ? 'airballs' : 'bricks')]);
}

// ===== finance.js — owner mode economics (all money in $ thousands) =====
const UPGRADES = {
  suites: { n: 'Luxury Suites', d: 'Adds 20 suites per level. Corporate money.', cost: [15000, 25000, 40000] },
  board: { n: 'Video Board', d: 'Fan happiness and in-arena ad sales.', cost: [8000, 15000, 25000] },
  conc: { n: 'Concourse & Concessions', d: '+10% concessions and merchandise per level.', cost: [10000, 18000, 30000] },
  prac: { n: 'Practice Facility', d: 'Faster player development. Free agents notice.', cost: [12000, 22000, 35000] },
  med: { n: 'Sports Medicine Center', d: 'Fewer injuries and quicker recoveries.', cost: [8000, 15000, 25000] },
  fan: { n: 'Fan Experience', d: 'A louder building: home-court edge and hype.', cost: [6000, 12000, 20000] },
};
const REF = { court: 380, lower: 62, upper: 24, food: 6, drink: 5, merch: 30, parking: 15, suite: 160 };
const PRICE_KEYS = [['court', 'Courtside', 'per seat'], ['lower', 'Lower Bowl', 'per seat'], ['upper', 'Upper Deck', 'per seat'],
  ['suite', 'Luxury Suite', 'season lease ($K)'], ['food', 'Food', 'avg item'], ['drink', 'Drinks', 'avg item'], ['merch', 'Merchandise', 'avg item'], ['parking', 'Parking', 'per car']];
const MKT = [{ n: 'None', cost: 0 }, { n: 'Local', cost: 1000 }, { n: 'Regional', cost: 2500 }, { n: 'National', cost: 5000 }];

function newLedger() {
  return { rev: { tix: 0, suites: 0, conc: 0, merch: 0, park: 0, media: 0, tv: 0, po: 0, naming: 0, ads: 0 }, exp: { sal: 0, staff: 0, ops: 0, mkt: 0, tax: 0, build: 0, debt: 0 }, att: 0, hg: 0, sell: 0 };
}
function initFinances(S, t) {
  t.fin = newLedger();
  if (t.prices.suite == null) t.prices.suite = Math.round(REF.suite * priceFactor(t.pop) / 5) * 5;
}
function ledgerTotal(o) { return U.sum(Object.values(o)); }
function staffPayroll(t) { return U.sum(Object.values(t.staff), s => s.sal); }

function topStars(S, tid) { const ps = U.sortBy(roster(S, tid), p => p.ovr); return ps.length ? (ps[0].ovr + (ps[1] ? ps[1].ovr : ps[0].ovr)) / 2 : 70; }
function teamWinPct(S, t) { const r = t.rec; if (r.w + r.l >= 5) return winPct(r); const h = t.hist[t.hist.length - 1]; return h ? h.w / Math.max(1, h.w + h.l) : 0.5; }

function infl(S) { return S.cap / 49500; }
function seatMap(t) { const cap = t.arena.cap; const court = Math.round(cap * 0.015); const lower = Math.round(cap * 0.45); return { court, lower, upper: cap - court - lower }; }

function demandFor(S, t, opp, po) {
  const winp = teamWinPct(S, t);
  const starF = 1 + (topStars(S, t.tid) - 82) / 45;
  const oppF = opp ? 1 + (topStars(S, opp.tid) - 84) / 90 : 1;
  let d = 0.6 + 0.3 * (t.hype / 100) + 0.22 * (t.fan / 100) + 0.38 * (winp - 0.5);
  d *= starF * oppF * (0.86 + 0.045 * Math.log(1 + t.pop)) * (0.9 + t.arena.cond / 1000 + t.arena.up.board * 0.02);
  if (po) d *= 1.3 + po * 0.08;
  return U.clamp(d, 0.15, 1.6);
}

// price projection used by both the sim and the Ticket Office preview
function gateProjection(S, t, opp, po, prices) {
  prices = prices || t.prices;
  const pf = priceFactor(t.pop) * infl(S);
  const dem = demandFor(S, t, opp, po);
  const seats = seatMap(t);
  const poMul = po ? 1.5 : 1;
  const el = { court: 0.7, lower: 1.15, upper: 1.45 };
  let att = 0, tix = 0;
  const fill = {};
  for (const k of ['court', 'lower', 'upper']) {
    const ref = REF[k] * pf * poMul;
    const f = U.clamp(dem * Math.pow(ref / Math.max(1, prices[k]), el[k]), 0, 1);
    fill[k] = f; att += seats[k] * f; tix += seats[k] * f * prices[k] * poMul / 1000;
  }
  att = Math.round(att);
  const cu = 1 + t.arena.up.conc * 0.1;
  const buyF = U.clamp(0.9 * Math.pow(REF.food * pf / prices.food, 1.3), 0, 1.6);
  const buyD = U.clamp(1.1 * Math.pow(REF.drink * pf / prices.drink, 1.3), 0, 1.8);
  const conc = att * (buyF * prices.food + buyD * prices.drink) * cu / 1000;
  const starF = 1 + (topStars(S, t.tid) - 82) / 30;
  const merch = (att * 0.12 * U.clamp(Math.pow(REF.merch * pf / prices.merch, 1.6), 0, 2) * prices.merch * cu * Math.max(0.5, starF)) / 1000;
  const cars = att / 2.6 * U.clamp(Math.pow(REF.parking * pf / prices.parking, 1.2), 0, 1);
  const park = cars * prices.parking / 1000;
  const sOcc = U.clamp(dem * Math.pow(REF.suite * pf / Math.max(1, prices.suite), 0.9), 0, 1);
  const suites = t.arena.suites * sOcc * prices.suite / 41;
  // fairness: how prices compare to what fans think is reasonable (1.0 = fair)
  const fair = (prices.lower / (REF.lower * pf) * 0.35 + prices.upper / (REF.upper * pf) * 0.3 + prices.food / (REF.food * pf) * 0.1 + prices.drink / (REF.drink * pf) * 0.1 + prices.parking / (REF.parking * pf) * 0.1 + prices.merch / (REF.merch * pf) * 0.05);
  return { att, fill, tix, conc, merch, park, suites, sOcc, dem, fair, cap: t.arena.cap };
}

function seasonScale(S) { return 82 / S.settings.games; }

function gameFinances(S, g, po) {
  const sc = seasonScale(S);
  const df = DIFFS[S.diff];
  for (const tid of [g.h, g.a]) {
    const t = S.teams[tid];
    if (!t.fin) initFinances(S, t);
    const L = t.fin;
    const net0 = ledgerTotal(L.rev) - ledgerTotal(L.exp);
    const rm = tid === S.user ? df.rev : 1;
    if (!po) {
      L.rev.tv += 30000 * infl(S) / S.settings.games;
      L.rev.media += (3000 + t.pop * 900) * infl(S) * (0.6 + t.hype / 125) / S.settings.games;
      L.exp.sal += payroll(S, tid) / S.settings.games;
      L.exp.staff += staffPayroll(t) / S.settings.games;
      L.exp.mkt += MKT[t.mkt].cost / S.settings.games;
      if (t.debt) L.exp.debt += t.debt.amt / S.settings.games;
    }
    if (tid === g.h) {
      const opp = S.teams[g.a];
      const gp = gateProjection(S, t, opp, po ? (S.playoffs ? S.playoffs.round + 1 : 1) : 0);
      const mult = (po ? 1 : sc) * rm;
      if (po) L.rev.po += (gp.tix + gp.conc + gp.merch + gp.park) * rm;
      else { L.rev.tix += gp.tix * mult; L.rev.conc += gp.conc * mult; L.rev.merch += gp.merch * mult; L.rev.park += gp.park * mult; L.rev.suites += gp.suites * mult; }
      L.rev.ads += t.arena.up.board * 18 * (po ? 1 : sc);
      if (t.arena.naming && !po) L.rev.naming += t.arena.naming.amt / 41 * sc;
      L.exp.ops += (380 + t.arena.cap * 0.008) * infl(S) * (po ? 1 : sc) * (1.1 - t.arena.cond / 500);
      L.att += gp.att; L.hg++; if (gp.att >= t.arena.cap * 0.995) L.sell++;
      // fan mood follows winning, prices and the building
      const winp = teamWinPct(S, t);
      const target = U.clamp(52 + (winp - 0.5) * 70 - (gp.fair - 1) * 45 + t.arena.up.board * 3 + t.arena.up.fan * 2 + (t.arena.cond - 70) / 6, 5, 98);
      t.fan = U.clamp(t.fan + (target - t.fan) * 0.06, 0, 100);
      t.lastGate = gp;
    }
    t.cash += ledgerTotal(L.rev) - ledgerTotal(L.exp) - net0;
  }
}

function hypeAfterGame(S, t, won, margin, po) {
  let d = won ? 0.35 : -0.3;
  if (t.rec.str >= 5) d += 0.2; if (t.rec.str <= -5) d -= 0.25;
  if (po) d *= 3;
  if (won && margin >= 20) d += 0.15;
  const base = 45 + t.mkt * 4 + t.arena.up.fan * 2;
  d += (base - t.hype) * 0.004;
  t.hype = U.clamp(t.hype + d, 0, 100);
}

function closeSeasonBooks(S) {
  for (const t of S.teams) {
    const L = t.fin;
    const pay = payroll(S, t.tid);
    const tax = pay > S.tax ? (pay - S.tax) : 0;
    L.exp.tax += tax;
    t.cash -= tax;
    if (tax > 0) {
      // tax pool shared with non-taxpayers
      t._tax = tax;
    }
  }
  const pool = U.sum(S.teams, t => t._tax || 0);
  const under = S.teams.filter(t => !t._tax);
  for (const t of under) { t.fin.rev.media += pool / Math.max(1, under.length); t.cash += pool / Math.max(1, under.length); }
  for (const t of S.teams) {
    delete t._tax;
    const L = t.fin;
    const rev = ledgerTotal(L.rev), exp = ledgerTotal(L.exp);
    t.finHist.push({ s: S.season, rev: Object.assign({}, L.rev), exp: Object.assign({}, L.exp), profit: rev - exp, att: L.hg ? Math.round(L.att / L.hg) : 0, sell: L.sell, hype: Math.round(t.hype), fan: Math.round(t.fan) });
    if (t.finHist.length > 25) t.finHist.shift();
    t.fin = newLedger();
  }
}

function buyUpgrade(S, t, key) {
  const lvl = t.arena.up[key];
  if (lvl >= 3) return 'Already maxed out.';
  const cost = UPGRADES[key].cost[lvl];
  if (t.cash < cost) return 'Not enough cash on hand.';
  t.cash -= cost; t.fin.exp.build += cost;
  t.arena.up[key]++;
  if (key === 'suites') t.arena.suites += 20;
  if (key === 'fan') t.hype = Math.min(100, t.hype + 3);
  return null;
}
function renovateCost(t) { return Math.round((100 - t.arena.cond) * 420); }
function renovate(S, t) {
  const c = renovateCost(t);
  if (c <= 0) return 'The building is in perfect shape.';
  if (t.cash < c) return 'Not enough cash on hand.';
  t.cash -= c; t.fin.exp.build += c; t.arena.cond = 100;
  return null;
}
function arenaQuote(S, t, cap) {
  const cost = Math.round((180000 + (cap - 17000) * 30) * (S.cap / 49500));
  const pub = U.clamp(0.12 + (t.fan - 50) / 180 + (t.hype - 50) / 300 + Math.log(1 + t.pop) * 0.04, 0, 0.6);
  return { cost, pub, own: Math.round(cost * (1 - pub)) };
}
function startArena(S, t, cap, pub) {
  const q = arenaQuote(S, t, cap);
  const share = Math.round(q.cost * (1 - pub));
  t.arena.build = { cap, cost: q.cost, own: share, left: 2, suites: Math.round(cap / 220) };
  const add = Math.round(share / 15);
  t.debt = t.debt ? { amt: Math.round((t.debt.amt * t.debt.yrs + share) / 15), yrs: 15, total: (t.debt.total || 0) + share } : { amt: add, yrs: 15, total: share };
  return t.arena.build;
}
function finishArenas(S) {
  for (const t of S.teams) {
    const b = t.arena.build;
    if (!b) continue;
    b.left--;
    if (b.left <= 0) {
      const up = t.arena.up;
      t.arena = { name: t.region + ' ' + U.pick(ARENA_SUFFIX), cap: b.cap, suites: b.suites, cond: 100, built: S.season, up: { suites: 1, board: Math.max(1, up.board), conc: Math.max(1, up.conc), prac: up.prac, med: up.med, fan: Math.max(1, up.fan) }, build: null, naming: null };
      t.hype = Math.min(100, t.hype + 15); t.fan = Math.min(100, t.fan + 10);
      addNews(S, { type: 'arena', tids: [t.tid], h: `${tname(t)} open the doors to their new ${t.arena.cap.toLocaleString()}-seat home`, b: `Fans got their first look at the new building tonight. The ${t.name} expect the new revenue streams to change how they compete.`, imp: 3 });
      if (t.tid === S.user) offerNaming(S, t);
    }
  }
}
function offerNaming(S, t) {
  const corp = U.pick(CORPS);
  const amt = Math.round((1500 + t.pop * 380) * (0.7 + t.hype / 100) / 10) * 10;
  const yrs = U.ri(5, 12);
  inbox(S, { from: corp + ' (Marketing Dept.)', subj: 'Arena naming rights proposal', body: `${corp} would like to put its name on your building: ${U.money(amt)} per season for ${yrs} seasons. The arena would become "${corp} ${t.arena.name.split(' ').pop()}".`, act: { kind: 'naming', corp, amt, yrs } });
}
function seasonMaintenance(S) {
  for (const t of S.teams) {
    t.arena.cond = U.clamp(t.arena.cond - U.rf(3, 6), 20, 100);
    if (t.debt) { t.debt.yrs--; if (t.debt.yrs <= 0) t.debt = null; }
    if (t.arena.naming) { t.arena.naming.yrs--; if (t.arena.naming.yrs <= 0) { t.arena.naming = null; if (t.tid === S.user) offerNaming(S, t); } }
    if (t.tid !== S.user) aiOwner(S, t);
  }
}
function aiOwner(S, t) {
  // AI owners keep the lights on: renovate tired buildings, buy a cheap upgrade when flush
  if (t.arena.cond < 55 && t.cash > renovateCost(t) * 1.5) renovate(S, t);
  if (t.cash > 40000 && Math.random() < 0.5) {
    const k = U.pick(Object.keys(UPGRADES));
    if (t.arena.up[k] < 3) buyUpgrade(S, t, k);
  }
  const pf = priceFactor(t.pop) * infl(S);
  const wp = teamWinPct(S, t);
  const m = 0.9 + wp * 0.25 + (t.hype - 50) / 300;
  t.prices.court = Math.round(REF.court * pf * m / 5) * 5; t.prices.lower = Math.round(REF.lower * pf * m); t.prices.upper = Math.round(REF.upper * pf * m);
  t.prices.suite = Math.round(REF.suite * pf * m / 5) * 5;
  t.mkt = t.cash > 30000 ? 2 : t.cash > 5000 ? 1 : 0;
}

// ===== story.js — newsroom, radio show, inbox, morale =====
function addNews(S, n) {
  n.id = S.nextNid++; n.s = S.season; n.d = S.day; n.ph = S.phase;
  S.news.unshift(n);
  if (S.news.length > 350) S.news.length = 350;
  return n;
}
function inbox(S, m) {
  m.id = S.nextNid++; m.s = S.season; m.d = S.day; m.read = false; m.done = false;
  S.inbox.unshift(m);
  if (S.inbox.length > 150) S.inbox.length = 150;
  return m;
}
function unread(S) { return S.inbox.filter(m => !m.read).length; }
function dateLabel(S, d, ph) {
  ph = ph != null ? ph : S.phase; d = d != null ? d : S.day;
  if (ph === PH.REG) return 'Day ' + d;
  if (ph === PH.PO) return 'Playoffs, Day ' + d;
  return PH_NAME[ph];
}
function localPaper(t) { return t.region + ' ' + PAPER_NAMES[(t.tid * 7 + t.region.length) % PAPER_NAMES.length]; }
function beatWriter(t) { return WRITERS[(t.tid * 3 + t.name.length) % WRITERS.length]; }

// ---------- player morale ----------
function expectedMinutes(rank) { return rank < 2 ? 31 : rank < 5 ? 25 : rank < 8 ? 15 : rank < 10 ? 7 : 0; }
function roleName(rank) { return rank < 1 ? 'Franchise Player' : rank < 2 ? 'Star' : rank < 5 ? 'Starter' : rank < 8 ? 'Rotation' : rank < 10 ? 'Bench' : 'End of Bench'; }
function teamRanks(S, tid) { const m = {}; U.sortBy(roster(S, tid), p => p.ovr).forEach((p, i) => m[p.pid] = i); return m; }
function currentMpg(S, p) { const t = seasonTotals(p, S.season, 0); return t.gp ? t.min / t.gp : null; }
function teamChem(S, tid) {
  const ps = roster(S, tid);
  if (!ps.length) return 50;
  const mor = U.avg(ps, p => p.morale);
  const cont = U.avg(ps, p => Math.min(5, S.season - p.joined));
  const lead = ps.some(p => p.pers === 'leader' && p.ovr >= 72) ? 5 : 0;
  const divas = ps.filter(p => p.pers === 'diva' && p.morale < 45).length * 4;
  return Math.round(U.clamp(mor * 0.7 + cont * 4 + lead - divas + 8, 0, 100));
}
function moodWord(m) { return m >= 80 ? 'Ecstatic' : m >= 65 ? 'Happy' : m >= 50 ? 'Content' : m >= 35 ? 'Frustrated' : m >= 20 ? 'Unhappy' : 'Furious'; }

function updateMorale(S) {
  for (const t of S.teams) {
    const ranks = teamRanks(S, t.tid);
    const wp = teamWinPct(S, t);
    const hasLeader = roster(S, t.tid).some(p => p.pers === 'leader' && p.ovr >= 72);
    for (const p of roster(S, t.tid)) {
      const rank = ranks[p.pid];
      const exp = expectedMinutes(rank);
      const mpg = currentMpg(S, p);
      let target = 60;
      target += (wp - 0.5) * (p.pers === 'winner' ? 70 : 35);
      if (mpg != null && !(p.inj && p.inj.games > 0)) target += U.clamp(mpg - exp, -16, 6) * (p.pers === 'diva' ? 1.6 : p.pers === 'easy' ? 0.45 : 1);
      const fair = marketSalary(S, p);
      const under = (fair - p.contract.amt) / 1000;
      if (under > 1) target -= Math.min(12, under * (p.pers === 'mercenary' ? 2.2 : 1));
      if (hasLeader) target += 4;
      if (p.pers === 'easy') target = 60 + (target - 60) * 0.6;
      if (p.pers === 'diva' && t.pop > 5) target += 3;
      if (p.prom) {
        if (S.day >= p.prom.until && S.phase === PH.REG) {
          const row = seasonTotals(p, S.season, 0);
          const gp = row.gp - p.prom.gp0, min = row.min - p.prom.min0;
          const kept = gp <= 0 ? true : (min / gp) >= p.prom.want - 2;
          if (kept) { p.morale = Math.min(100, p.morale + 12); if (t.tid === S.user) inbox(S, { from: pname(p), subj: 'Thanks for keeping your word', body: `Coach gave me the minutes you promised. I won't forget that.` }); }
          else {
            p.morale = Math.max(0, p.morale - 22);
            if (t.tid === S.user) inbox(S, { from: pname(p), subj: 'You lied to me', body: `You promised me ${p.prom.want} minutes a night. I'm averaging ${(min / gp).toFixed(1)} since. I want out.`, act: { kind: 'tradereq', pid: p.pid } });
          }
          p.prom = null;
        } else target += 4;
      }
      p.morale = U.clamp(p.morale + (target - p.morale) * 0.22 + U.gauss(0, 1.5), 0, 100);
      // complaints to the user's front office
      if (t.tid === S.user && S.phase === PH.REG && !p.prom && mpg != null && rank < 10) {
        const last = p.lastGripe || -99;
        if (p.morale < 38 && mpg < exp - 5 && S.day - last > 25 && Math.random() < 0.6) {
          p.lastGripe = S.day;
          inbox(S, { from: pname(p), subj: 'I need more minutes', body: `I'm averaging ${mpg.toFixed(1)} minutes. A player of my ability (${roleName(rank)}) should be closer to ${exp}+. What are you going to do about it?`, act: { kind: 'pt', pid: p.pid, want: exp } });
        } else if (p.morale < 18 && S.day - last > 30 && Math.random() < 0.5) {
          p.lastGripe = S.day;
          inbox(S, { from: `${pname(p)}'s agent`, subj: 'Formal trade request', body: `My client has lost confidence in the direction of this franchise and requests a trade.`, act: { kind: 'tradereq', pid: p.pid } });
        }
      }
    }
  }
}

function resolveInbox(S, id, choice) {
  const m = S.inbox.find(x => x.id === id);
  if (!m || m.done) return null;
  m.done = true; m.read = true;
  const a = m.act || {};
  const p = a.pid != null ? P(S, a.pid) : null;
  let msg = null;
  if (a.kind === 'pt' && p) {
    if (choice === 'promise') { const row = seasonTotals(p, S.season, 0); p.prom = { want: a.want, until: S.day + 21, gp0: row.gp, min0: row.min }; p.morale = Math.min(100, p.morale + 8); msg = `${pname(p)} likes what he hears. Give him ${a.want}+ minutes over the next three weeks.`; }
    else if (choice === 'earn') { p.morale = Math.max(0, p.morale - (p.pers === 'diva' ? 12 : 5)); msg = `${pname(p)} did not take that well.`; }
    else if (choice === 'block') { if (!S.tradeBlock.includes(p.pid)) S.tradeBlock.push(p.pid); msg = `${pname(p)} is on the trading block.`; }
  } else if (a.kind === 'tradereq' && p) {
    if (choice === 'block') { if (!S.tradeBlock.includes(p.pid)) S.tradeBlock.push(p.pid); p.morale = Math.min(100, p.morale + 5); msg = `${pname(p)} is on the trading block.`; }
    else if (choice === 'talk') { if (Math.random() < 0.45 + (p.pers === 'loyal' ? 0.25 : 0)) { p.morale = Math.min(100, p.morale + 15); msg = `The sit-down worked. ${pname(p)} is willing to give it another shot.`; } else { p.morale = Math.max(0, p.morale - 6); msg = `${pname(p)} walked out of the meeting.`; } }
  } else if (a.kind === 'naming') {
    if (choice === 'accept') {
      const t = S.teams[S.user];
      const suf = t.arena.name.split(' ').pop();
      t.arena.naming = { corp: a.corp, amt: a.amt, yrs: a.yrs };
      t.arena.name = a.corp + ' ' + suf;
      msg = `Welcome to ${t.arena.name}.`;
      addNews(S, { type: 'arena', tids: [t.tid], h: `${t.name} sell arena naming rights to ${a.corp}`, b: `The deal is worth ${U.money(a.amt)} a season over ${a.yrs} seasons.`, imp: 2 });
    } else msg = 'You passed on the naming deal.';
  } else if (a.kind === 'sponsor') {
    if (choice === 'accept') { const t = S.teams[S.user]; t.cash += a.amt; t.fin.rev.ads += a.amt; t.fan = U.clamp(t.fan + (a.fan || 0), 0, 100); t.hype = U.clamp(t.hype + (a.hype || 0), 0, 100); msg = `Deal done: +${U.money(a.amt)}.`; }
    else msg = 'You declined the promotion.';
  } else if (a.kind === 'ext') {
    msg = 'Maybe later.';
  } else if (a.kind === 'offer') {
    const o = S.offers.find(x => x.id === a.oid);
    if (o && choice === 'accept') { const r = acceptOffer(S, o); msg = r || 'Trade complete.'; if (r) m.done = false; }
    else { S.offers = S.offers.filter(x => x.id !== a.oid); msg = 'Offer declined.'; }
  }
  m.reply = msg;
  return msg;
}

// ---------- weekly radio show ----------
// picks a line not used recently, so the show doesn't repeat itself week to week
function fresh(S, key, arr) {
  S.rUsed = S.rUsed || {};
  const used = S.rUsed[key] || [];
  const pool = arr.map((x, i) => i).filter(i => !used.includes(i));
  const i = pool.length ? U.pick(pool) : U.ri(0, arr.length - 1);
  S.rUsed[key] = used.concat([i]).slice(-Math.max(1, Math.floor(arr.length * 0.6)));
  return arr[i];
}
function radioShow(S, special) {
  const t = S.teams[S.user];
  const r = t.rec, wp = winPct(r), gp = r.w + r.l;
  const H = RADIO.host.split(' ')[0], C = RADIO.cohost.split(' ')[0];
  const T = t.name, CITY = t.region;
  const lines = [];
  const say = (who, text) => lines.push({ who, text });
  const ps = U.sortBy(roster(S, t.tid), p => p.ovr);
  const star = ps[0], second = ps[1];
  const weekStats = (p) => { const rows = recentLines(S, p.pid, 7); if (!rows.length) return null; return { g: rows.length, pts: U.avg(rows, x => x.pts), reb: U.avg(rows, x => x.orb + x.drb), ast: U.avg(rows, x => x.ast) }; };
  say(H, fresh(S, 'intro', [
    `Welcome back to ${RADIO.show} on ${RADIO.station}! ${RADIO.host} here with ${RADIO.cohost}, and the phones are LIT about your ${T}.`,
    `It's ${RADIO.show}, you're on ${RADIO.station}. Lotta ground to cover on the ${T} today, so let's get right to it.`,
    `Good afternoon, ${CITY}! ${RADIO.host} and ${RADIO.cohost}, ${RADIO.show}, and we are talking ${T} basketball.`,
    `Pull the car over, turn it up. ${RADIO.show} is on the air and ${C} is already mad at me.`,
    `You found us. ${RADIO.station}, home of the ${T}. I'm ${RADIO.host}, she's ${RADIO.cohost}, and nobody's hanging up on me today.`,
    `Hour two of ${RADIO.show}. Phone lines are full, the coffee is cold, and the ${T} are the only thing on the menu.`,
    `Big show today, ${CITY}. Let's talk some ${T} hoops.`,
  ]));
  if (special === 'draft') {
    const picks = S.draft ? S.draft.picks.filter(k => k.tid === t.tid && k.pid).map(k => P(S, k.pid)).filter(Boolean) : [];
    if (picks.length) {
      const top = picks[0];
      say(H, fresh(S, 'draft1', [`Draft night is in the books. The ${T} went with ${pname(top)} out of ${top.college}. ${C}, grade it.`, `So the ${T} took ${pname(top)}. ${top.age} years old, ${U.hgt(top.hgt)}, plays ${top.pos}. I want to like it, ${C}.`, `${pname(top)}. That's the pick. Let's see if he's a guy or a "guy."`]));
      const g = U.grade(Math.max(top.pot, top.ovr) + (top.draft && top.draft.pick <= 5 ? -4 : 6));
      say(C, `I'm giving it ${/^[AB]/.test(g) ? 'a solid' : 'a shaky'} ${g}. ${top.pot >= 85 ? "The upside is real. Be patient with him." : top.ovr >= 68 ? "He can help right away, but I don't see a star." : "That's a project. Two, three years before we know."}`);
    } else say(H, `The ${T} sat out the draft. No picks. I hope somebody upstairs has a plan.`);
  } else if (special === 'fa') {
    const signed = S.trans.filter(x => x.s === S.season && x.type === 'sign' && x.tids.includes(t.tid) && x.ph === PH.FA).slice(0, 3);
    if (signed.length) { say(H, `Free agency recap. The ${T} were busy: ${signed.map(x => x.text.replace(/^\w+ signed /, '')).join('; ')}.`); say(C, fresh(S, 'fa1', ['I like the aggression. You don\'t win standing still.', 'Some of that money is going to look bad in two years. But that\'s next year\'s problem.', 'Depth. They finally bought some depth.'])); }
    else { say(H, `Free agency came and went, and the ${T} did... nothing. Nothing at all.`); say(C, fresh(S, 'fa0', ['Sometimes the best deal is the one you don\'t make.', 'The fans wanted a splash. They got a puddle.'])); }
  } else if (gp === 0) say(H, fresh(S, 'camp', [`No games yet, but I'm hearing big things out of training camp. ${star ? pname(star) + ' looks like a man on a mission.' : ''}`, `Camp is open. ${star ? 'The whole thing hinges on ' + pname(star) + '.' : ''} If he's healthy, anything can happen.`, `Preseason predictions, ${C}. I've got the ${T} winning ${Math.round(30 + (teamStrength(S, t.tid) - 72) * 4)} games. Write it down.`]));
  else if (wp >= 0.68) say(H, fresh(S, 'rec4', [`${r.w} and ${r.l}! I'll say it: this team is the real deal. When's the last time this city felt like this?`, `${r.w}-${r.l}. I have been doing this show a long time, and this might be the most fun team I've covered.`, `${r.w} wins. ${r.l} losses. I'm running out of superlatives, ${C}.`, `Championship or bust. At ${r.w}-${r.l}, anything less is a disappointment.`]));
  else if (wp >= 0.52) say(H, fresh(S, 'rec3', [`${r.w}-${r.l}. Not bad. Not great. I need to see this team beat the big boys before I buy a parade float.`, `${r.w} and ${r.l}. Solid. But "solid" doesn't hang banners, ${C}.`, `A ${r.w}-${r.l} team. Good enough to make the playoffs, good enough to get bounced in the first round.`, `${r.w}-${r.l}, and I still can't tell you what this team is.`]));
  else if (wp >= 0.38) say(H, fresh(S, 'rec2', [`${r.w}-${r.l}. Mediocrity, folks. The worst place to be in this league.`, `${r.w} and ${r.l}, and I'm running out of patience. Somebody upstairs has to make a move.`, `${r.w}-${r.l}. Not good enough to win, not bad enough to get a top pick. Purgatory.`, `I keep waiting for the turn. ${r.w}-${r.l}. Still waiting.`]));
  else say(H, fresh(S, 'rec1', [`${r.w}-${r.l}. I'm not gonna sugarcoat it. Start learning about ping-pong balls, people.`, `I've seen better basketball at the Y on a Tuesday night. ${r.w}-${r.l}. Brutal.`, `${r.w} and ${r.l}. I got an email asking if we could stop talking about the ${T}. Denied.`, `The ${T} are ${r.w}-${r.l}. My mother called. She wants to know what happened.`]));
  if (!special) {
    if (r.str >= 5) say(C, fresh(S, 'hot', [`${r.str} straight wins, ${H}. The building is rocking again.`, `${r.str} in a row! Nobody wants to play these guys right now.`, `That's ${r.str} straight. I'm not saying I'm on the bandwagon. I'm saying I'm looking at the bandwagon.`]));
    else if (r.str <= -5) say(C, fresh(S, 'cold', [`That's ${-r.str} losses in a row. You can feel it in the arena. It's quiet. Too quiet.`, `${-r.str} straight losses. Somebody call a team meeting. Somebody call ANYONE.`, `The losing streak is at ${-r.str}. The body language is the worst part.`]));
    if (star) {
      const w = weekStats(star);
      if (w && w.g >= 2) say(C, w.pts >= 25 ? fresh(S, 'starhot', [`And ${pname(star)}? ${w.pts.toFixed(1)} a night this week. He's carrying this franchise.`, `${pname(star)} is playing like an MVP. ${w.pts.toFixed(1)} points per game this week.`, `Give ${pname(star)} the ball and get out of the way. ${w.pts.toFixed(1)} a night!`])
        : w.pts < 12 ? fresh(S, 'starcold', [`What's going on with ${pname(star)}? ${w.pts.toFixed(1)} points a game this week. That's not a max-player stat line.`, `${pname(star)} looks tired. Or hurt. Or both. ${w.pts.toFixed(1)} a game won't cut it.`])
          : `${pname(star)} quietly giving you ${w.pts.toFixed(1)}, ${w.reb.toFixed(1)} boards and ${w.ast.toFixed(1)} assists this week.`);
    }
    const hurt = roster(S, t.tid).filter(p => p.inj && p.inj.games > 3).sort((a, b) => b.ovr - a.ovr)[0];
    if (hurt) say(H, fresh(S, 'inj', [`And the injury bug: ${pname(hurt)} still out with the ${hurt.inj.type.toLowerCase()}. That hurts.`, `${pname(hurt)} is still in street clothes. ${hurt.inj.games} more games, they say. I'll believe it when I see it.`]));
  }
  // callers
  const callers = [];
  const addC = (k, f) => callers.push({ k, f });
  const g = t.lastGate;
  const strat = t.strat;
  if (g && g.fair > 1.18) addC('c1', () => [`I took my kids to the game Saturday. ${U.dollars(t.prices.lower)} for lower bowl, ${U.dollars(t.prices.food)} for a hot dog, ${U.dollars(t.prices.parking)} to PARK? The owner is robbing us blind!`, `At those prices, ${S.ownerName} better hope this team wins.`]);
  if (g && g.fair > 1.18) addC('c2', () => [`Is anybody going to say it? Half the lower bowl was empty last week. Lower the prices!`, `Empty seats don't buy beer, ${C}. The owner should know that.`]);
  if (g && g.fair < 0.85) addC('c3', () => [`Gotta give the owner credit. Tickets are affordable, the hot dogs are cheap. Great family night out.`, `See, ${C}? Treat the fans right and they show up.`]);
  if (t.arena.cond < 50) addC('c4', () => [`${H}, have you been in the bathrooms at ${t.arena.name}? Disgraceful. Fix the building!`, `The old barn is falling apart. They gotta reinvest.`]);
  if (t.arena.build) addC('c5', () => [`Drove by the new arena site. Cranes everywhere! I can't wait.`, `New building, new era. If they put a winner in it.`]);
  const bust = ps.find(p => p.contract.amt > 7000 && p.ovr < 76);
  if (bust) addC('c6', () => [`Trade ${pname(bust)}! He's making ${U.money(bust.contract.amt)} a year and giving us nothing!`, `Easy to say, tough to do with that contract. Who's taking that on?`]);
  const rook = ps.find(p => p.yrsPro === 0 && p.draft && p.draft.year === S.season);
  if (rook) addC('c7', () => [`I love what I'm seeing from the rookie, ${pname(rook)}. Play the kid more!`, `The kid's got something. Patience, though. Rookies hit the wall.`]);
  if (wp < 0.4 && gp > 10) addC('c8', () => [`Fire ${staffName(t.staff.hc)}! He's lost the locker room!`, `Firing the coach is the easy headline. The roster is the problem.`]);
  if (strat.def === 'zone' && gp > 5) addC('c9', () => [`Why are we playing so much zone? Teams are raining threes on us!`, `It's a choice. Hides some bad individual defenders. I get it, but I don't love it.`]);
  if (strat.pace === 2 && gp > 5) addC('c10', () => [`I love this run-and-gun stuff! Most fun team to watch in years!`, `Fun, sure. Let's see if it holds up in a seven-game series.`]);
  if (strat.pace === 0 && gp > 5) addC('c11', () => [`This offense is putting me to sleep. Walk it up, walk it up, every time!`, `Grind-it-out ball wins in May. Not in February ratings, though.`]);
  const divRival = standings(S, x => x.div === t.div && x.tid !== t.tid)[0];
  if (divRival) addC('c12', () => [`I don't care what the record is, as long as we beat ${divRival.region}. Can't stand that team.`, `The ${divRival.name} rivalry is real, folks. Circle those dates.`]);
  if (wp >= 0.6 && gp > 10) addC('c13', () => [`I'm calling it right now: championship. This is the year. I can feel it, ${H}!`, `Easy there. Let's get through the first round before we plan the parade route.`]);
  if (S.phase === PH.REG && S.day < S.deadlineDay && S.deadlineDay - S.day < 14) addC('c14', () => [`Trade deadline's coming. We gotta make a move. Go get a star!`, `Every caller wants a star. Nobody wants to give one up.`]);
  if (t.hype > 70) addC('c15', () => [`First time in years my buddies at work are talking about the ${T} instead of football!`, `The buzz is real. Bandwagon's filling up fast.`]);
  if (second && star) addC('c16', () => [`Who's better, ${pname(star)} or ${pname(second)}? My brother-in-law and I have been fighting about it for a week.`, `It's ${pname(star)}, and it's not close. Tell your brother-in-law ${H} said so.`]);
  if (S.tradeBlock.length) { const b = P(S, S.tradeBlock[0]); if (b) addC('c17', () => [`I hear ${pname(b)} is on the trading block. Is that true? Why would you do that?`, `If the price is right, everybody is available. That's the business.`]); }
  if (t.cash < 0) addC('c18', () => [`I read the team is losing money. Are they going to move the team? Tell me they're not moving the team!`, `Nobody's moving anywhere. Yet.`]);
  if (special === 'draft') addC('c19', () => [`Best draft in years! Can't wait for summer league!`, `Summer league. Where every rookie looks like a Hall of Famer.`]);
  S.rUsed = S.rUsed || {};
  const recent = S.rUsed.callers || [];
  U.shuffle(callers);
  callers.sort((x, y) => (recent.includes(x.k) ? 1 : 0) - (recent.includes(y.k) ? 1 : 0));
  const chosen = callers.slice(0, U.ri(2, 3));
  S.rUsed.callers = recent.concat(chosen.map(c => c.k)).slice(-5);
  for (const c of chosen.map(x => x.f)) {
    const [q, a] = c();
    say(`${U.pick(RADIO.callerFirst)} from ${U.pick(RADIO.callerTown)}`, q);
    say(Math.random() < 0.6 ? H : C, a);
  }
  say(H, fresh(S, 'outro', [`That's all the time we've got. Keep those calls coming, ${CITY}!`, `We'll be right back after this. Don't touch that dial.`, `Gotta pay some bills. More ${T} talk after the break.`, `${C} gets the last word. ${C}?`, `Lines are open. We'll be back.`]));
  const ep = { s: S.season, d: S.day, ph: S.phase, title: special === 'draft' ? 'Draft Night Grades' : special === 'fa' ? 'Free Agency Report Card' : radioTitle(S, t), lines };
  S.radio.unshift(ep); if (S.radio.length > 25) S.radio.length = 25;
  return ep;
}
function radioTitle(S, t) {
  const r = t.rec;
  if (r.w + r.l === 0) return 'Camp Talk: Expectations';
  if (r.str >= 5) return 'The Streak Is On';
  if (r.str <= -5) return 'Rock Bottom?';
  if (S.phase === PH.PO) return 'Playoff Fever';
  return winPct(r) >= 0.55 ? 'Contender Check' : winPct(r) < 0.4 ? 'Blow It Up?' : 'Stuck in the Middle';
}
function recentLines(S, pid, days) {
  const out = [];
  for (const gid in S.box) {
    const b = S.box[gid];
    if (b.s !== S.season || S.day - b.d > days) continue;
    for (const T of b.teams) for (const l of T.ps) if (l.pid === pid) out.push(l);
  }
  return out;
}

// ---------- weekly league stuff ----------
function powerRankings(S) {
  const rows = S.teams.map(t => {
    const r = t.rec, gp = r.w + r.l;
    const net = gp ? (r.pf - r.pa) / gp : 0;
    const str = U.avg(U.sortBy(roster(S, t.tid).filter(p => !p.inj), p => p.ovr).slice(0, 8), p => p.ovr);
    return { tid: t.tid, v: (gp ? winPct(r) : 0.5) * 40 + net * 1.2 + (str - 70) * (gp < 20 ? 2 : 0.8) };
  }).sort((a, b) => b.v - a.v);
  const prev = S.power || [];
  S.power = rows.map((x, i) => ({ tid: x.tid, rank: i + 1, prev: (prev.find(p => p.tid === x.tid) || { rank: i + 1 }).rank }));
  return S.power;
}
function weeklyNews(S) {
  const pr = powerRankings(S);
  const top = S.teams[pr[0].tid], riser = pr.slice().sort((a, b) => (b.prev - b.rank) - (a.prev - a.rank))[0];
  const ut = S.teams[S.user], ur = pr.find(x => x.tid === S.user);
  addNews(S, { type: 'power', tids: [top.tid], h: `Power Rankings: ${tname(top)} hold the top spot`, b: `${top.name} (${top.rec.w}-${top.rec.l}) lead this week's rankings. Biggest climber: ${tname(S.teams[riser.tid])}, up ${riser.prev - riser.rank} spots. Your ${ut.name} check in at No. ${ur.rank}.`, imp: 1 });
  // local beat column
  const t = ut, r = t.rec;
  if (r.w + r.l >= 3) {
    const ps = U.sortBy(roster(S, t.tid), p => (seasonTotals(p, S.season).pts / Math.max(1, seasonTotals(p, S.season).gp)));
    const lead = ps[0];
    const ppg = r.pf / (r.w + r.l), opp = r.pa / (r.w + r.l);
    addNews(S, {
      type: 'column', tids: [t.tid], local: true, by: beatWriter(t),
      h: U.pick([`${t.name} notebook: ${r.w}-${r.l} and ${winPct(r) >= 0.5 ? 'trending the right way' : 'searching for answers'}`, `Beat column: What we learned about the ${t.name} this week`, `${t.name} at ${r.w}-${r.l}: grading the week`]),
      b: `The ${t.name} are scoring ${ppg.toFixed(1)} a night and allowing ${opp.toFixed(1)}. ${lead ? pname(lead) + ' leads the team in scoring, and the offense runs through him.' : ''} ${ppg - opp > 4 ? 'The point differential says this is a legitimate team.' : ppg - opp < -4 ? 'The point differential is ugly, and it is not a fluke.' : 'The margins are thin, and every possession matters.'} Team chemistry grades out at ${teamChem(S, t.tid)}/100.`,
      imp: 1,
    });
  }
  // random sponsorship / promo offer for the owner
  if (Math.random() < 0.18) {
    const corp = U.pick(CORPS);
    const amt = Math.round(U.rf(150, 900) * (0.7 + ut.hype / 100));
    const promo = U.pick([['Bobblehead Night', 2, 1], ['Free T-Shirt Friday', 3, 0], ['Halftime Car Giveaway', 1, 3], ['Kids Eat Free Night', 4, 0], ['Throwback Jersey Night', 1, 2]]);
    inbox(S, { from: corp, subj: `Sponsorship: ${promo[0]}`, body: `${corp} wants to sponsor a ${promo[0]} at ${ut.arena.name}. They'll pay ${U.money(amt)}. Fans love these nights.`, act: { kind: 'sponsor', amt, fan: promo[1], hype: promo[2] } });
  }
}

// ---------- notable game stories ----------
function gameStories(S, g, sim, po) {
  const H = S.teams[g.h], A = S.teams[g.a];
  const w = sim.score[0] > sim.score[1] ? 0 : 1, wt = w === 0 ? H : A, lt = w === 0 ? A : H;
  const ws = Math.max(...sim.score), ls = Math.min(...sim.score);
  const isUser = g.h === S.user || g.a === S.user;
  for (const s of [0, 1]) {
    const T = sim.T[s], team = S.teams[T.tid], opp = S.teams[sim.T[1 - s].tid];
    for (const gp of T.ps) {
      const st = gp.st, reb = st.orb + st.drb;
      const n = pname(gp.p);
      const dd = [st.pts, reb, st.ast, st.stl, st.blk].filter(x => x >= 10).length;
      if (st.pts >= 45) addNews(S, { type: 'perf', tids: [team.tid], pids: [gp.pid], h: `${n} erupts for ${st.pts} as ${team.name} ${s === w ? 'top' : 'fall to'} ${opp.name}`, b: `${n} went ${st.fgm}-for-${st.fga} from the field, ${st.tpm}-for-${st.tpa} from deep, and ${st.ftm}-for-${st.fta} at the line in ${Math.round(st.min)} minutes.`, imp: st.pts >= 55 ? 5 : 4 });
      else if (st.pts >= 38 && (isUser || Math.random() < 0.5)) addNews(S, { type: 'perf', tids: [team.tid], pids: [gp.pid], h: `${n} pours in ${st.pts} against ${opp.region}`, b: `${n} added ${reb} rebounds and ${st.ast} assists.`, imp: 2, local: team.tid === S.user });
      if (dd >= 3) addNews(S, { type: 'perf', tids: [team.tid], pids: [gp.pid], h: `${n} posts a triple-double: ${st.pts}/${reb}/${st.ast}`, b: `The ${team.name} ${s === w ? 'won' : 'lost'} ${sim.score[s]}-${sim.score[1 - s]} against ${tname(opp)}.`, imp: 3 });
      else if (st.pts >= 20 && reb >= 20) addNews(S, { type: 'perf', tids: [team.tid], pids: [gp.pid], h: `${n} goes for ${st.pts} and ${reb} against ${opp.name}`, b: `A monster 20-20 night.`, imp: 3 });
      // records
      pushRecord(S.records.game.pts, { v: st.pts, pid: gp.pid, n, tid: team.tid, s: S.season, opp: opp.abbr });
      pushRecord(S.records.game.reb, { v: reb, pid: gp.pid, n, tid: team.tid, s: S.season, opp: opp.abbr });
      pushRecord(S.records.game.ast, { v: st.ast, pid: gp.pid, n, tid: team.tid, s: S.season, opp: opp.abbr });
    }
  }
  if (sim.q >= 6) addNews(S, { type: 'game', tids: [H.tid, A.tid], h: `${wt.name} outlast ${lt.name} in ${sim.q - 4}OT marathon, ${ws}-${ls}`, b: `It took ${sim.q - 4} overtimes to settle it.`, imp: 3 });
  if (ws - ls >= 35) addNews(S, { type: 'game', tids: [wt.tid], h: `${wt.name} demolish ${lt.name} by ${ws - ls}`, b: `${ws}-${ls}. It was over early.`, imp: 2 });
  if (sim.walkoff) { const p = P(S, sim.walkoff); addNews(S, { type: 'game', tids: [wt.tid], pids: [p.pid], h: `${pname(p)} beats the buzzer! ${wt.name} stun ${lt.name}, ${ws}-${ls}`, b: `Pandemonium${g.h === wt.tid ? ' in ' + wt.region : ' on the road'}.`, imp: 4, local: isUser }); }
  for (const tm of [wt, lt]) {
    const st = tm.rec.str;
    if ((st >= 7 || st <= -8) && Math.abs(st) % 2 === 1) addNews(S, { type: 'streak', tids: [tm.tid], h: st > 0 ? `${tname(tm)} win ${st} straight` : `${tname(tm)} drop ${-st} in a row`, b: st > 0 ? `The ${tm.name} are the hottest team in the league.` : `The ${tm.name} can't buy a win.`, imp: Math.abs(st) >= 11 ? 3 : 2 });
  }
  if (isUser && !po) {
    const ut = S.user === H.tid ? 0 : 1;
    const top = U.maxBy(sim.T[ut].ps, x => x.st.pts + (x.st.orb + x.st.drb) * 0.6 + x.st.ast * 0.8);
    const won = ut === w;
    addNews(S, { type: 'recap', tids: [S.user], local: true, h: `${S.teams[S.user].name} ${won ? (ws - ls >= 15 ? 'cruise past' : 'beat') : (ws - ls >= 15 ? 'routed by' : 'fall to')} ${S.teams[sim.T[1 - ut].tid].name}, ${sim.score[ut]}-${sim.score[1 - ut]}`, b: `${top ? pname(top.p) + ' led the way with ' + top.st.pts + ' points, ' + (top.st.orb + top.st.drb) + ' rebounds and ' + top.st.ast + ' assists.' : ''}`, imp: 1, gid: g.gid });
  }
}
function pushRecord(list, rec) {
  if (list.length >= 10 && rec.v <= list[list.length - 1].v) return;
  list.push(rec); list.sort((a, b) => b.v - a.v); if (list.length > 10) list.length = 10;
}

// ===== transactions.js — contracts, free agency, draft, trades, AI roster moves =====
const ROSTER_MAX = 15, ROSTER_MIN = 13;
function offseason(S) { return S.phase >= PH.END; }
function firstSeason(S) { return offseason(S) ? S.season + 1 : S.season; }
function teamPay(S, tid) { return offseason(S) ? payrollNext(S, tid) : payroll(S, tid); }
function rosterCount(S, tid) { return offseason(S) ? S.players.filter(p => p.tid === tid && p.contract.exp > S.season).length : roster(S, tid).length; }
function capSpace(S, tid) { return S.cap - teamPay(S, tid); }
function rosterMax(S) { return offseason(S) ? 17 : ROSTER_MAX; }

function logTrans(S, type, tids, text) { S.trans.unshift({ s: S.season, d: S.day, ph: S.phase, type, tids, text }); if (S.trans.length > 400) S.trans.length = 400; }

// can team sign a free agent at this salary? returns null or reason
function signBlock(S, tid, amt) {
  if (rosterCount(S, tid) >= rosterMax(S)) return `Roster is full (${rosterMax(S)} max).`;
  const room = capSpace(S, tid);
  if (amt <= room) return null;
  if (amt <= S.minSal * 1.6) return null; // minimum-level deals always allowed
  if (!S.teams[tid].mle && amt <= S.mle) return null;
  return `Not enough cap room (${U.money(Math.max(0, room))}). Over the cap you can offer up to the mid-level exception (${U.money(S.mle)}) once, or a minimum deal.`;
}
function usesMLE(S, tid, amt) { return amt > capSpace(S, tid) && amt > S.minSal * 1.6 && amt <= S.mle; }

function signPlayer(S, p, tid, amt, yrs, how) {
  const t = S.teams[tid];
  if (how !== 'resign' && usesMLE(S, tid, amt)) t.mle = true;
  const fromTid = p.tid;
  p.tid = tid;
  p.contract = { amt: Math.round(amt / 10) * 10, exp: firstSeason(S) + yrs - 1 };
  if (fromTid !== tid) { p.joined = S.season; p.num = 0; assignNumbers(S, tid); }
  p.morale = U.clamp(p.morale + 10, 0, 100);
  p.neg = 0; p.fa = null; p.noResign = false;
  delete p.ask;
  logTrans(S, how || 'sign', [tid], `${t.abbr} ${how === 'resign' ? 're-signed' : 'signed'} ${pname(p)} (${p.pos}, ${p.ovr}) — ${yrs} yr / ${U.money(amt)}`);
  if (tid === S.user || p.ovr >= 80) addNews(S, { type: 'sign', tids: [tid], pids: [p.pid], h: `${tname(t)} ${how === 'resign' ? 'bring back' : 'sign'} ${pname(p)}`, b: `${yrs} year${yrs > 1 ? 's' : ''}, ${U.money(amt)} per season.`, imp: p.ovr >= 85 ? 3 : 2, local: tid === S.user });
  if (!S.teams[tid].autoRot && tid === S.user) ensureRotation(S, tid);
  return p;
}
function releasePlayer(S, p, why) {
  const t = S.teams[p.tid];
  const ng = p.contract.ng || p.contract.amt <= S.minSal * 1.05;
  const first = firstSeason(S);
  if (!ng && p.contract.exp >= first) t.dead.push({ pid: p.pid, n: pname(p), amt: p.contract.amt, exp: p.contract.exp });
  logTrans(S, 'release', [t.tid], `${t.abbr} released ${pname(p)}${ng ? '' : ' (' + U.money(p.contract.amt) + ' dead money through ' + U.seasonLabel(p.contract.exp) + ')'}`);
  p.tid = -1; p.morale = Math.max(30, p.morale - 10);
  p.contract = { amt: Math.round(marketSalary(S, p) * 0.9), exp: S.season };
  S.tradeBlock = S.tradeBlock.filter(x => x !== p.pid);
  if (t.tid === S.user) ensureRotation(S, t.tid);
}

// ---------- re-signing ----------
function contractAsk(S, p, tid) {
  let amt = marketSalary(S, p);
  const mood = p.morale;
  let mult = 1;
  if (tid >= 0 && tid === p.tid) {
    if (mood < 40) mult += 0.12; if (mood > 75) mult -= 0.05;
    if (p.pers === 'loyal') mult -= 0.1;
    if (p.pers === 'winner' && teamWinPct(S, S.teams[tid]) < 0.45) mult += 0.1;
  }
  if (p.pers === 'mercenary') mult += 0.08;
  amt = Math.round(U.clamp(amt * mult, S.minSal, S.maxSal) / 10) * 10;
  return { amt, yrs: p.askYrs || (p.askYrs = askYears(p)) };
}
function resignStatus(S, p) {
  if (p.noResign) return 'refuses';
  if (!S.teams[p.tid]) return 'testing';
  if (p.morale < 22 && p.pers !== 'loyal') return 'refuses';
  if (p.pers === 'winner' && teamWinPct(S, S.teams[p.tid]) < 0.4 && p.morale < 55) return 'testing';
  if (p.morale < 40) return 'testing';
  return 'willing';
}
function negotiate(S, p, amt, yrs) {
  if (!p || p.tid !== S.user) return { ok: false, msg: 'He is not under contract with you.' };
  const st = resignStatus(S, p);
  if (st === 'refuses') return { ok: false, msg: `${pname(p)} won't negotiate. He's headed to free agency.` };
  const ask = contractAsk(S, p, p.tid);
  let leeway = 0.03 + (p.morale - 50) / 600 + (p.pers === 'loyal' ? 0.05 : 0) - (st === 'testing' ? 0.04 : 0);
  const yrPen = Math.abs(yrs - ask.yrs) * 0.04;
  const need = ask.amt * (1 - leeway + yrPen);
  if (amt >= need) {
    if (!offseason(S)) {
      // extension: this season's salary stands, the new deal starts next season
      p.contract.exp = S.season + yrs; p.contract.next = Math.round(amt / 10) * 10; p.neg = 0; p.morale = U.clamp(p.morale + 10, 0, 100);
      logTrans(S, 'resign', [p.tid], `${S.teams[p.tid].abbr} extended ${pname(p)} — ${yrs} yr / ${U.money(amt)} starting ${U.seasonLabel(S.season + 1)}`);
      addNews(S, { type: 'sign', tids: [p.tid], pids: [p.pid], h: `${tname(S.teams[p.tid])} extend ${pname(p)}`, b: `${yrs} more year${yrs > 1 ? 's' : ''} at ${U.money(amt)} per season, starting next season.`, imp: p.ovr >= 85 ? 3 : 2, local: true });
    } else {
      p.contract.exp = S.season;
      signPlayer(S, p, p.tid, amt, yrs, 'resign');
    }
    return { ok: true, msg: `${pname(p)} agrees to ${yrs} year${yrs > 1 ? 's' : ''} at ${U.money(amt)}.` };
  }
  p.neg = (p.neg || 0) + 1;
  p.morale = Math.max(0, p.morale - (p.pers === 'diva' || p.pers === 'mercenary' ? 5 : 3));
  if (p.neg >= 3) { p.noResign = true; return { ok: false, msg: `${pname(p)} is insulted and breaks off talks.` }; }
  const close = amt / need;
  return { ok: false, msg: close > 0.93 ? `Close. ${pname(p)}'s agent says you're almost there.` : close > 0.8 ? `${pname(p)}'s camp wants significantly more.` : `${pname(p)}'s agent laughs and hangs up.` };
}
// in-season extension for contract-year players
function canExtend(S, p) { return p.tid === S.user && p.contract.exp === S.season && !p.contract.next && (S.phase === PH.REG || S.phase === PH.PRE); }

function aiResign(S) {
  for (const t of S.teams) {
    if (t.tid === S.user) continue;
    const exp = roster(S, t.tid).filter(p => p.contract.exp <= S.season);
    const ps = U.sortBy(exp, p => playerWorth(p));
    for (const p of ps) {
      if (p.noResign || resignStatus(S, p) === 'refuses') continue;
      const ask = contractAsk(S, p, t.tid);
      const pay = payrollNext(S, t.tid);
      const want = playerWorth(p) >= 70 || (p.age <= 25 && p.pot >= 75);
      const afford = pay + ask.amt <= S.tax * (playerWorth(p) >= 82 ? 1.12 : 0.98);
      const room = S.players.filter(x => x.tid === t.tid && x.contract.exp > S.season).length < 15;
      if (want && afford && room && Math.random() < 0.85) { p.contract.exp = S.season; signPlayer(S, p, t.tid, ask.amt, ask.yrs, 'resign'); }
    }
  }
}

// ---------- free agency ----------
function toFreeAgency(S) {
  // everyone whose deal is up becomes a free agent
  for (const p of S.players) {
    if (p.tid >= 0 && p.contract.exp <= S.season) {
      const t = S.teams[p.tid];
      p.prevTid = p.tid;
      if (p.ovr >= 78 || p.prevTid === S.user) logTrans(S, 'fa', [p.tid], `${pname(p)} hits free agency (left ${t.abbr})`);
      p.tid = -1;
    }
  }
  for (const p of S.players.filter(x => x.tid === -1)) {
    const a = contractAsk(S, p, -1);
    p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt };
    p.fa = { offers: [] };
  }
}
function faScore(S, p, tid, amt, yrs) {
  const t = S.teams[tid];
  const ask = p.ask || contractAsk(S, p, -1);
  let money = amt / Math.max(S.minSal, ask.amt);
  money -= Math.abs(yrs - ask.yrs) * 0.035;
  if (p.age >= 30 && yrs > ask.yrs) money += 0.04 * (yrs - ask.yrs);
  const wp = teamWinPct(S, t);
  const ranks = U.sortBy(roster(S, tid), x => x.ovr);
  const wouldRank = ranks.filter(x => x.ovr > p.ovr).length;
  let fit = (wp - 0.5) * (p.pers === 'winner' ? 0.4 : 0.15) + Math.log(1 + t.pop) * 0.012 + t.arena.up.prac * 0.015 + (t.hype - 50) / 600;
  fit += wouldRank < 5 ? 0.06 : wouldRank < 8 ? 0.02 : -0.05 * (p.pers === 'diva' ? 2 : 1);
  if (p.prevTid === tid) fit += p.pers === 'loyal' ? 0.12 : 0.03;
  if (tid === S.user) fit += DIFFS[S.diff].fa;
  const w = p.pers === 'mercenary' ? 1.35 : 1;
  return money * w + fit - (w - 1);
}
function interestLabel(v) { return v >= 1.08 ? 'Very High' : v >= 1.0 ? 'High' : v >= 0.92 ? 'Medium' : v >= 0.84 ? 'Low' : 'Very Low'; }

function startFA(S) {
  S.fa = { day: 1, days: 10 };
  for (const t of S.teams) t.mle = false;
}
function userOffer(S, p, amt, yrs) {
  const why = signBlock(S, S.user, amt);
  if (why) return why;
  if (amt < (p.ask ? p.ask.amt * 0.5 : 0)) return `That's not a serious offer.`;
  p.fa = p.fa || { offers: [] };
  p.fa.offers = p.fa.offers.filter(o => o.tid !== S.user);
  p.fa.offers.push({ tid: S.user, amt, yrs, day: S.fa ? S.fa.day : 0 });
  return null;
}
function aiFAOffers(S, early) {
  const fas = U.sortBy(S.players.filter(p => p.tid === -1 && p.ask), p => playerWorth(p));
  for (const t of U.shuffle(S.teams.slice())) {
    if (t.tid === S.user) continue;
    const count = rosterCount(S, t.tid);
    if (count >= 15) continue;
    const outstanding = fas.filter(p => p.fa && p.fa.offers.some(o => o.tid === t.tid)).length;
    if (outstanding >= (count < 12 ? 3 : 2)) continue;
    const room = capSpace(S, t.tid);
    const ranks = U.sortBy(roster(S, t.tid).filter(p => !offseason(S) || p.contract.exp > S.season), p => p.ovr);
    const eighth = ranks[7] ? ranks[7].ovr : 60;
    for (const p of fas) {
      if (p.fa.offers.some(o => o.tid === t.tid)) continue;
      if (p.ovr < eighth - 2 && count >= 12) continue;
      const mode = teamMode(S, t.tid);
      let amt = p.ask.amt * (mode === 'rebuild' && room > p.ask.amt * 1.3 ? U.rf(1.0, 1.18) : U.rf(0.88, 1.06));
      if (amt > room) {
        const day = S.fa ? S.fa.day : 10;
        if (!t.mle && (p.ask.amt <= S.mle * 1.15 || (day >= 3 && playerWorth(p) >= 70))) amt = Math.min(amt, S.mle);
        else if (count < 13 && p.ask.amt <= S.minSal * 1.6) amt = Math.min(amt, S.minSal * 1.5);
        else continue;
      }
      if (payrollNext(S, t.tid) + amt > S.tax * 1.05 && playerWorth(p) < 82) continue;
      if (signBlock(S, t.tid, amt)) continue;
      p.fa.offers.push({ tid: t.tid, amt: Math.round(amt / 10) * 10, yrs: U.clamp(p.ask.yrs + U.ri(-1, 1), 1, 5), day: S.fa ? S.fa.day : 0 });
      break;
    }
  }
}
function faDecisions(S, finalDay) {
  const day = S.fa ? S.fa.day : 10;
  const signed = [];
  for (const p of U.sortBy(S.players.filter(x => x.tid === -1 && x.fa && x.fa.offers.length), x => playerWorth(x))) {
    // drop offers that are no longer legal
    p.fa.offers = p.fa.offers.filter(o => !signBlock(S, o.tid, o.amt) || (o.tid === S.user && false));
    if (!p.fa.offers.length) continue;
    const decideP = finalDay ? 1 : U.clamp(0.22 + day * 0.11 + (playerWorth(p) < 70 ? 0.2 : 0), 0, 1);
    if (Math.random() > decideP) continue;
    let best = null, bv = -9;
    for (const o of p.fa.offers) { const v = faScore(S, p, o.tid, o.amt, o.yrs) + U.gauss(0, 0.03); if (v > bv) { bv = v; best = o; } }
    const thresh = 0.97 - day * 0.025;
    if (bv >= thresh || finalDay) {
      const lost = p.fa.offers.filter(o => o.tid === S.user && o !== best).length;
      signPlayer(S, p, best.tid, best.amt, best.yrs, 'sign');
      signed.push(p);
      if (lost) inbox(S, { from: 'Front Office', subj: `${pname(p)} signs elsewhere`, body: `${pname(p)} chose ${tname(S.teams[best.tid])} (${best.yrs} yr / ${U.money(best.amt)}) over your offer.` });
      if (best.tid === S.user) inbox(S, { from: 'Front Office', subj: `${pname(p)} accepts your offer!`, body: `${pname(p)} signed: ${best.yrs} yr / ${U.money(best.amt)}.` });
    }
  }
  return signed;
}
function faAdvanceDay(S) {
  aiFAOffers(S);
  const signed = faDecisions(S, false);
  for (const p of S.players.filter(x => x.tid === -1 && x.ask)) p.ask.amt = Math.max(S.minSal, Math.round(p.ask.amt * 0.96 / 10) * 10);
  S.fa.day++;
  return signed;
}
function endFA(S) {
  aiFAOffers(S); faDecisions(S, true);
  for (const t of S.teams) if (t.tid !== S.user) aiFillRoster(S, t.tid);
  for (const p of S.players.filter(x => x.tid === -1)) { p.fa = null; }
  S.fa = null;
  radioShow(S, 'fa');
}
// instant decision for in-season signings
function signNow(S, p, amt, yrs) {
  const why = signBlock(S, S.user, amt);
  if (why) return { ok: false, msg: why };
  if (!p.ask) { const a = contractAsk(S, p, -1); p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt }; }
  const v = faScore(S, p, S.user, amt, yrs);
  if (v >= 0.95) { signPlayer(S, p, S.user, amt, yrs, 'sign'); return { ok: true, msg: `${pname(p)} signs with the ${S.teams[S.user].name}!` }; }
  return { ok: false, msg: `${pname(p)} turned it down. Interest: ${interestLabel(v)}.` };
}

// ---------- AI roster upkeep ----------
function aiFillRoster(S, tid) {
  let n = rosterCount(S, tid);
  const healthy = roster(S, tid).filter(p => !p.inj || p.inj.games <= 0).length;
  let need = Math.max(ROSTER_MIN - n, offseason(S) ? 0 : 9 - healthy);
  while (need > 0) {
    const pool = U.sortBy(S.players.filter(p => p.tid === -1), p => playerWorth(p) + U.rf(0, 3));
    const p = pool.find(x => !signBlock(S, tid, S.minSal));
    if (!p) break;
    const ask = p.ask ? p.ask.amt : marketSalary(S, p);
    const room = Math.max(S.minSal * 1.5, capSpace(S, tid), S.teams[tid].mle ? 0 : S.mle);
    const amt = Math.max(S.minSal, Math.min(ask, room));
    const big = amt > S.minSal * 1.6;
    signPlayer(S, p, tid, Math.round(amt), big ? U.ri(2, 3) : 1, 'sign');
    if (!big) p.contract.ng = true;
    need--;
  }
}
function aiTrimRoster(S, tid) {
  const max = rosterMax(S);
  let ps = offseason(S) ? S.players.filter(p => p.tid === tid && p.contract.exp > S.season) : roster(S, tid);
  while (ps.length > max) {
    const cut = U.sortBy(ps, p => -(playerWorth(p) + (p.contract.ng ? -4 : 0) + p.contract.amt / 2500))[0];
    releasePlayer(S, cut);
    ps = ps.filter(p => p !== cut);
  }
}

// ---------- draft ----------
function rookieScale(S, pick) {
  if (pick > 30) return S.minSal;
  return Math.round((3900 - (pick - 1) * 107) * S.cap / 49500 / 10) * 10;
}
function lotteryTeams(S) {
  const po = new Set(S.playoffs ? S.playoffs.seeds.flat() : []);
  return standings(S).filter(t => !po.has(t.tid)).reverse(); // worst first
}
const LOTTO_ODDS = [250, 199, 156, 119, 88, 63, 53, 43, 28, 17, 11, 8, 7, 6];
function runLottery(S) {
  const lt = lotteryTeams(S);
  const pool = lt.map((t, i) => ({ tid: t.tid, w: LOTTO_ODDS[i] || 5, seed: i + 1 }));
  const winners = [];
  for (let k = 0; k < 3; k++) {
    const rem = pool.filter(x => !winners.includes(x));
    winners.push(U.wpick(rem, x => x.w));
  }
  const order = winners.concat(pool.filter(x => !winners.includes(x)));
  const year = S.season + 1;
  const poTeams = standings(S).filter(t => !lt.includes(t)).reverse();
  const r1 = order.map(x => x.tid).concat(poTeams.map(t => t.tid));
  const r2 = standings(S).reverse().map(t => t.tid);
  const picks = [];
  r1.forEach((tid, i) => { const k = S.picks.find(x => x.year === year && x.rd === 1 && x.orig === tid); picks.push({ pick: i + 1, rd: 1, orig: tid, tid: k ? k.tid : tid }); });
  r2.forEach((tid, i) => { const k = S.picks.find(x => x.year === year && x.rd === 2 && x.orig === tid); picks.push({ pick: 31 + i, rd: 2, orig: tid, tid: k ? k.tid : tid }); });
  S.lottery = { year, results: order.map((x, i) => ({ tid: x.tid, seed: x.seed, pick: i + 1, odds: (x.w / 10).toFixed(1) })) };
  S.draft = { year, picks, cur: 0, done: false };
  const jump = order.slice(0, 3).filter((x, i) => x.seed > i + 1);
  const w = S.teams[order[0].tid];
  addNews(S, { type: 'draft', tids: [w.tid], h: `${tname(w)} win the draft lottery!`, b: `${w.name} will pick first in the ${year} Draft${order[0].seed > 1 ? ', jumping from the No. ' + order[0].seed + ' slot' : ''}.${jump.length > 1 ? ' Lottery luck was everywhere.' : ''}`, imp: 4 });
  return S.lottery;
}
function prospects(S, year) { return S.players.filter(p => p.tid === -2 && p.dyear === (year || (S.draft ? S.draft.year : S.season + 1))); }
function scoutSd(S, lvl) { const sc = S.teams[S.user].staff.scout.r.eval; const f = 1.25 - sc / 140; return lvl >= 2 ? [0, 1.5 * f] : lvl === 1 ? [2.5 * f, 4.5 * f] : [5.5 * f, 9 * f]; }
function perceived(S, p) {
  if (p.tid !== -2) return { ovr: p.ovr, pot: p.pot };
  const [so, sp] = scoutSd(S, p.slvl || 0);
  return { ovr: U.clamp(Math.round(p.ovr + p.sn.o * so), 30, 99), pot: U.clamp(Math.round(p.pot + p.sn.p * sp), 35, 99) };
}
function scoutProspect(S, p, lvl) {
  const cost = lvl === 2 ? 20 : 8;
  const have = p.slvl || 0;
  if (have >= lvl) return 'Already scouted at that level.';
  const c = lvl === 2 && have === 1 ? 12 : cost;
  if (S.scout.pts < c) return 'Not enough scouting points.';
  S.scout.pts -= c; p.slvl = lvl;
  return null;
}
function aiDraftValue(S, tid, p) {
  const sc = S.teams[tid].staff.scout.r.eval;
  const noise = p['an' + (tid % 5)] != null ? p['an' + (tid % 5)] : (p['an' + (tid % 5)] = U.gauss(0, 1));
  return p.ovr * 0.42 + p.pot * 0.58 + noise * (6 - sc / 25) - (p.age - 19) * 0.6;
}
function makeDraftPick(S, pid) {
  const d = S.draft; const pk = d.picks[d.cur];
  const p = P(S, pid);
  p.tid = pk.tid; p.draft = { year: d.year, rd: pk.rd, pick: pk.pick, tid: pk.tid };
  const amt = rookieScale(S, pk.pick);
  p.contract = { amt, exp: d.year + (pk.rd === 1 ? 2 : 1), ng: pk.rd === 2, rookie: true };
  p.joined = S.season + 1; p.yrsPro = 0; delete p.sn; p.slvl = 3;
  pk.pid = pid;
  S.picks = S.picks.filter(k => !(k.year === d.year && k.rd === pk.rd && k.orig === pk.orig));
  assignNumbers(S, pk.tid);
  const t = S.teams[pk.tid];
  logTrans(S, 'draft', [pk.tid], `${t.abbr} select ${pname(p)} (${p.pos}, ${p.college}) at No. ${pk.pick}`);
  if (pk.pick <= 3 || pk.tid === S.user) addNews(S, { type: 'draft', tids: [pk.tid], pids: [pid], h: `${tname(t)} take ${pname(p)} at No. ${pk.pick}`, b: `The ${p.age}-year-old ${p.pos} out of ${p.college} (${U.hgt(p.hgt)}, ${p.wgt} lbs).`, imp: pk.pick === 1 ? 4 : 2, local: pk.tid === S.user });
  d.cur++;
  if (d.cur >= d.picks.length) d.done = true;
  return p;
}
function aiPick(S) {
  const d = S.draft; const pk = d.picks[d.cur];
  const pool = prospects(S, d.year);
  if (!pool.length) { d.cur++; if (d.cur >= d.picks.length) d.done = true; return null; }
  const ros = roster(S, pk.tid);
  const posCount = POSS.map(ps => ros.filter(p => p.pos === ps).length);
  const best = U.maxBy(pool, p => aiDraftValue(S, pk.tid, p) + (posCount[POS_IDX[p.pos]] <= 1 ? 1.5 : 0));
  return makeDraftPick(S, best.pid);
}
function finishDraft(S) {
  while (!S.draft.done) aiPick(S);
  for (const p of prospects(S, S.draft.year)) {
    p.tid = -1; p.draft = { year: S.draft.year, rd: 0, pick: 0, tid: -1 }; delete p.sn; p.slvl = 3; p.yrsPro = 0;
    p.contract = { amt: S.minSal, exp: S.season };
  }
  S.picks = S.picks.filter(k => k.year !== S.draft.year);
  if (!S.draft.radio) { S.draft.radio = true; radioShow(S, 'draft'); }
}

// ---------- trades ----------
function teamStrength(S, tid) { return U.avg(U.sortBy(roster(S, tid), p => p.ovr).slice(0, 8), p => p.ovr); }
function teamMode(S, tid) {
  const t = S.teams[tid];
  const ranks = S.teams.map(x => ({ tid: x.tid, v: teamStrength(S, x.tid) + (x.rec.w + x.rec.l > 10 ? (winPct(x.rec) - 0.5) * 10 : 0) })).sort((a, b) => b.v - a.v);
  const r = ranks.findIndex(x => x.tid === tid);
  return r < 9 ? 'contend' : r >= 21 ? 'rebuild' : 'neutral';
}
function projectedPick(S, origTid) {
  const ranks = S.teams.map(x => ({ tid: x.tid, v: teamStrength(S, x.tid) + (x.rec.w + x.rec.l > 10 ? (winPct(x.rec) - 0.5) * 12 : 0) })).sort((a, b) => a.v - b.v);
  return ranks.findIndex(x => x.tid === origTid) + 1;
}
function pickValue(S, k, mode) {
  const proj = projectedPick(S, k.orig);
  let v = k.rd === 1 ? 70 * Math.pow(0.93, proj - 1) + 6 : 3;
  v *= Math.pow(0.9, Math.max(0, k.year - S.season - 1));
  if (mode === 'rebuild') v *= 1.25; if (mode === 'contend') v *= 0.8;
  return v;
}
function pickLabel(S, k) { return `${k.year} ${k.rd === 1 ? '1st' : '2nd'} (${S.teams[k.orig].abbr})`; }
function assetsValue(S, tid, pids, picks, forTid) {
  const mode = teamMode(S, forTid);
  return U.sum(pids, id => P(S, id) ? Math.max(-15, tradeValue(S, P(S, id), mode)) : 0) + U.sum(picks, id => { const k = S.picks.find(x => x.id === id); return k ? pickValue(S, k, mode) : 0; });
}
function salaryOf(S, pids) { return U.sum(pids, id => P(S, id).contract.amt); }
// a = tid giving aGive {pids,picks} and receiving bGive from b
function tradeProblems(S, a, b, aGive, bGive) {
  const probs = [];
  if (S.phase === PH.REG && S.day > S.deadlineDay) probs.push('The trade deadline has passed.');
  if (S.phase === PH.PO) probs.push('No trades during the playoffs.');
  for (const [tid, give] of [[a, aGive], [b, bGive]]) {
    for (const id of give.pids) { const p = P(S, id); if (!p || p.tid !== tid) probs.push(`${p ? pname(p) : 'A player'} is no longer on ${S.teams[tid].abbr}.`); }
    for (const id of give.picks) { const k = S.picks.find(x => x.id === id); if (!k || k.tid !== tid) probs.push(`A selected draft pick is no longer available.`); }
  }
  if (probs.length) return probs;
  for (const [tid, give, get] of [[a, aGive, bGive], [b, bGive, aGive]]) {
    const t = S.teams[tid];
    const n = rosterCount(S, tid) - give.pids.length + get.pids.length;
    if (n > rosterMax(S)) probs.push(`${t.abbr} would have ${n} players (max ${rosterMax(S)}).`);
    const out = salaryOf(S, give.pids), inc = salaryOf(S, get.pids);
    const after = teamPay(S, tid) - out + inc;
    if (after > S.cap && inc > out * 1.25 + 100) probs.push(`${t.abbr} is over the cap: incoming salary (${U.money(inc)}) can't exceed 125% of outgoing (${U.money(out)}) + $100K.`);
  }
  return probs;
}
function aiTradeVerdict(S, aiTid, aiGive, aiGet, margin) {
  const give = assetsValue(S, aiTid, aiGive.pids, aiGive.picks, aiTid);
  const get = assetsValue(S, aiTid, aiGet.pids, aiGet.picks, aiTid);
  const need = give * margin + (aiGive.pids.length + aiGive.picks.length ? 1 : 0);
  return { ok: get >= need && get > 0, give, get, need };
}
function executeTrade(S, a, b, aGive, bGive) {
  const ta = S.teams[a], tb = S.teams[b];
  const move = (pids, to) => pids.forEach(id => { const p = P(S, id); p.tid = to; p.joined = S.season; p.morale = U.clamp(p.morale - 4 + (teamMode(S, to) === 'contend' ? 6 : 0), 0, 100); p.prom = null; S.tradeBlock = S.tradeBlock.filter(x => x !== id); });
  move(aGive.pids, b); move(bGive.pids, a);
  aGive.picks.forEach(id => { S.picks.find(k => k.id === id).tid = b; });
  bGive.picks.forEach(id => { S.picks.find(k => k.id === id).tid = a; });
  assignNumbers(S, a); assignNumbers(S, b);
  if (S.draft && !S.draft.done) for (const pk of S.draft.picks) { if (pk.pid) continue; const k = S.picks.find(x => x.year === S.draft.year && x.rd === pk.rd && x.orig === pk.orig); if (k) pk.tid = k.tid; }
  const desc = (give) => give.pids.map(id => pname(P(S, id))).concat(give.picks.map(id => pickLabel(S, S.picks.find(k => k.id === id)))).join(', ') || 'nothing';
  const text = `${ta.abbr} trade ${desc(aGive)} to ${tb.abbr} for ${desc(bGive)}`;
  logTrans(S, 'trade', [a, b], text);
  const big = aGive.pids.concat(bGive.pids).map(id => P(S, id)).sort((x, y) => y.ovr - x.ovr)[0];
  addNews(S, { type: 'trade', tids: [a, b], h: big ? `Trade: ${pname(big)} dealt to ${big.tid === a ? ta.name : tb.name}` : `${ta.name} and ${tb.name} swap picks`, b: text + '.', imp: big && big.ovr >= 82 ? 4 : 2, local: a === S.user || b === S.user });
  for (const tid of [a, b]) { if (tid !== S.user) { aiTrimRoster(S, tid); aiFillRoster(S, tid); } ensureRotation(S, tid); }
  S.offers = S.offers.filter(o => !o.pids.concat(o.get.pids).some(id => aGive.pids.includes(id) || bGive.pids.includes(id)));
}
function proposeTrade(S, b, give, get) {
  const probs = tradeProblems(S, S.user, b, give, get);
  if (probs.length) return { ok: false, msg: probs.join(' ') };
  const v = aiTradeVerdict(S, b, get, give, DIFFS[S.diff].trade);
  if (!v.ok) {
    const r = v.get / Math.max(1, v.need);
    return { ok: false, msg: r > 0.9 ? `${S.teams[b].abbr}: "We're close. Sweeten it a little."` : r > 0.7 ? `${S.teams[b].abbr}: "Not enough value coming back for us."` : `${S.teams[b].abbr}: "Not interested. Don't insult us."`, v };
  }
  executeTrade(S, S.user, b, give, get);
  return { ok: true, msg: 'Trade accepted!', v };
}
// AI builds a package from its own assets worth about `target` in its own eyes.
// maxSal caps the total salary the package may carry (so the other side stays cap-legal).
function buildPackage(S, tid, target, exclude = [], maxSal = Infinity) {
  const mode = teamMode(S, tid);
  const assets = [];
  const stars = U.sortBy(roster(S, tid), p => p.ovr).slice(0, 2).map(p => p.pid);
  for (const p of roster(S, tid)) if (!exclude.includes(p.pid) && !(stars.includes(p.pid) && mode === 'contend')) assets.push({ pid: p.pid, v: Math.max(0, tradeValue(S, p, mode)), sal: p.contract.amt });
  for (const k of S.picks.filter(k => k.tid === tid)) assets.push({ pick: k.id, v: pickValue(S, k, mode), sal: 0 });
  U.shuffle(assets);
  assets.sort((x, y) => y.v - x.v + U.rf(-4, 4));
  const out = { pids: [], picks: [] }; let sum = 0, sal = 0;
  for (const a of assets) {
    if (sum >= target * 0.97) break;
    if (a.v < 1) continue;
    if (sum + a.v > target * 1.15) continue;
    if (sal + a.sal > maxSal) continue;
    if (a.pid) out.pids.push(a.pid); else out.picks.push(a.pick);
    sum += a.v; sal += a.sal;
    if (out.pids.length + out.picks.length >= 4) break;
  }
  return { pkg: out, v: sum };
}
// add salary filler from tid so that a capped-out team can legally take on `incoming`
function matchSalary(S, tid, pkg, incoming, exclude = [], maxTotal = Infinity) {
  const out = () => salaryOf(S, pkg.pids);
  const ok = () => teamPay(S, tid) - out() + incoming <= S.cap || incoming <= out() * 1.25 + 100;
  let guard = 0;
  while (!ok() && guard++ < 4 && pkg.pids.length < 4) {
    const need = (incoming - 100) / 1.25 - out();
    const pool = roster(S, tid).filter(p => !pkg.pids.includes(p.pid) && !exclude.includes(p.pid) && out() + p.contract.amt <= maxTotal);
    if (!pool.length) break;
    // prefer the cheapest-value contract that closes the gap without overshooting
    const pick = U.maxBy(pool, p => -(Math.abs(p.contract.amt - need) / 1000) - Math.max(0, tradeValue(S, p, 'neutral')) / 25 + (p.contract.amt >= need ? 1 : 0));
    pkg.pids.push(pick.pid);
  }
  return ok();
}
function tradeBlockOffers(S) {
  if (!S.tradeBlock.length || S.phase === PH.PO || (S.phase === PH.REG && S.day > S.deadlineDay)) return;
  for (const pid of S.tradeBlock) {
    const p = P(S, pid);
    if (!p || p.tid !== S.user) continue;
    if (Math.random() > 0.55) continue;
    const t = U.pick(S.teams.filter(x => x.tid !== S.user));
    const val = tradeValue(S, p, teamMode(S, t.tid));
    if (val < 2) continue;
    const userMax = teamPay(S, S.user) - p.contract.amt <= S.cap ? Infinity : p.contract.amt * 1.25 + 100;
    const { pkg, v } = buildPackage(S, t.tid, (val - 1) * U.rf(0.85, 1.0) / DIFFS[S.diff].trade, [], userMax);
    if (!pkg.pids.length && !pkg.picks.length) continue;
    const give = { pids: [pid], picks: [] };
    matchSalary(S, t.tid, pkg, p.contract.amt, [pid]);
    if (!aiTradeVerdict(S, t.tid, pkg, give, 1.0).ok) continue;
    if (tradeProblems(S, S.user, t.tid, give, pkg).length) continue;
    const o = { id: S.nextNid++, tid: t.tid, pids: [pid], get: pkg, d: S.day, s: S.season };
    S.offers.push(o);
    const desc = pkg.pids.map(id => `${pname(P(S, id))} (${P(S, id).pos}, ${P(S, id).ovr})`).concat(pkg.picks.map(id => pickLabel(S, S.picks.find(k => k.id === id)))).join(', ');
    inbox(S, { from: `${tname(t)} GM`, subj: `Offer for ${pname(p)}`, body: `We'd give you ${desc} for ${pname(p)}.`, act: { kind: 'offer', oid: o.id } });
  }
  S.offers = S.offers.filter(o => S.day - o.d < 14 || o.s !== S.season);
}
function acceptOffer(S, o) {
  const give = { pids: o.pids, picks: [] };
  if (o.pids.some(id => P(S, id).tid !== S.user) || o.get.pids.some(id => P(S, id).tid !== o.tid) || o.get.picks.some(id => { const k = S.picks.find(x => x.id === id); return !k || k.tid !== o.tid; })) { S.offers = S.offers.filter(x => x !== o); return 'That offer is no longer valid.'; }
  const probs = tradeProblems(S, S.user, o.tid, give, o.get);
  if (probs.length) return probs.join(' ');
  executeTrade(S, S.user, o.tid, give, o.get);
  S.offers = S.offers.filter(x => x !== o);
  return null;
}
function aiAiTrade(S, tries = 8) {
  for (let i = 0; i < tries; i++) if (aiAiTryOnce(S)) return true;
  return false;
}
function aiAiTryOnce(S) {
  if (S.phase === PH.REG && S.day > S.deadlineDay) return;
  const ai = S.teams.filter(t => t.tid !== S.user);
  const buyers = ai.filter(t => teamMode(S, t.tid) === 'contend'), sellers = ai.filter(t => teamMode(S, t.tid) === (Math.random() < 0.75 ? 'rebuild' : 'neutral'));
  if (!buyers.length || !sellers.length) return;
  const b = U.pick(buyers), s = U.pick(sellers);
  const vet = U.sortBy(roster(S, s.tid).filter(p => p.age >= 27 && p.ovr >= 72), p => p.ovr)[U.ri(0, 2)];
  if (!vet) return;
  const val = tradeValue(S, vet, teamMode(S, b.tid));
  const sellerMax = teamPay(S, s.tid) - vet.contract.amt <= S.cap ? Infinity : vet.contract.amt * 1.25 + 100;
  const { pkg } = buildPackage(S, b.tid, val * 0.98, [], sellerMax);
  if (!pkg.pids.length && !pkg.picks.length) return;
  const give = { pids: [vet.pid], picks: [] };
  matchSalary(S, b.tid, pkg, vet.contract.amt, [], sellerMax);
  // seller may need to take back less salary than it sends
  if (tradeProblems(S, s.tid, b.tid, give, pkg).length) return;
  const v1 = aiTradeVerdict(S, s.tid, give, pkg, 1.0), v2 = aiTradeVerdict(S, b.tid, pkg, give, 0.95);
  if (v1.ok && v2.ok) { executeTrade(S, s.tid, b.tid, give, pkg); return true; }
  return false;
}

// ===== fantasy.js — fantasy draft: every rostered player goes into one pool =====
function startFantasyDraft(S) {
  const pool = S.players.filter(p => p.tid >= 0);
  for (const p of pool) { p.tid = -4; p.num = 0; }
  const order = U.shuffle(S.teams.map(t => t.tid));
  const rounds = 13;
  const picks = [];
  for (let r = 0; r < rounds; r++) { const ord = r % 2 ? order.slice().reverse() : order; ord.forEach(tid => picks.push({ rd: r + 1, tid })); }
  S.fdraft = { picks, cur: 0, done: false, order };
  S.tradeBlock = [];
}
function fdPool(S) { return S.players.filter(p => p.tid === -4); }
function fdPick(S, pid) {
  const F = S.fdraft, pk = F.picks[F.cur], p = P(S, pid);
  p.tid = pk.tid; p.joined = S.season; pk.pid = pid;
  F.cur++;
  if (F.cur >= F.picks.length) finishFantasyDraft(S);
  return p;
}
function fdValue(S, tid, p) {
  const ros = roster(S, tid);
  const posCount = ros.filter(x => x.pos === p.pos).length;
  const need = posCount === 0 ? 4 : posCount === 1 ? 1.5 : posCount >= 3 ? -3 : 0;
  const yrs = Math.max(1, p.contract.exp - S.season + 1);
  const capHit = (p.contract.amt - marketSalary(S, p)) / 1000 * Math.min(yrs, 3) * 0.25;
  return playerWorth(p) + need - capHit + U.rf(-1.5, 1.5);
}
function fdAI(S) {
  const F = S.fdraft, pk = F.picks[F.cur];
  const best = U.maxBy(fdPool(S), p => fdValue(S, pk.tid, p));
  return fdPick(S, best.pid);
}
function finishFantasyDraft(S) {
  const F = S.fdraft;
  F.done = true;
  for (const p of fdPool(S)) { p.tid = -1; p.ask = null; const a = contractAsk(S, p, -1); p.contract = { amt: a.amt, exp: S.season }; }
  for (const t of S.teams) {
    assignNumbers(S, t.tid);
    for (const p of roster(S, t.tid)) p.morale = U.ri(55, 75);
    autoRotation(S, t.tid);
    if (t.tid !== S.user) { aiTrimRoster(S, t.tid); aiFillRoster(S, t.tid); }
  }
  addNews(S, { type: 'league', tids: [], h: 'Fantasy draft complete: a brand-new league', b: `Every roster was rebuilt from scratch. First overall: ${pname(P(S, F.picks[0].pid))} to the ${S.teams[F.picks[0].tid].name}.`, imp: 4 });
}

// ===== season.js — calendar, playoffs, awards, offseason =====
const LINE_KEYS = ['min', 'pts', 'fgm', 'fga', 'tpm', 'tpa', 'ftm', 'fta', 'orb', 'drb', 'ast', 'stl', 'blk', 'tov', 'pf'];

function todaysGames(S) {
  if (S.phase === PH.REG) return S.sched.filter(g => g.day === S.day);
  if (S.phase === PH.PO) return poToday(S);
  return [];
}
function userGameToday(S) { return todaysGames(S).find(g => g.hs == null && (g.h === S.user || g.a === S.user)); }
function seasonOver(S) { return S.phase === PH.REG && S.sched.every(g => g.hs != null); }

function playGame(S, g, sim) {
  if (!sim) { sim = new GameSim(S, g, {}); sim.simToEnd(); }
  applyResult(S, g, sim);
  return sim;
}

function applyResult(S, g, sim) {
  const po = S.phase === PH.PO;
  g.hs = sim.score[0]; g.as = sim.score[1]; g.ot = Math.max(0, sim.q - 4);
  for (const s of [0, 1]) {
    const T = sim.T[s];
    for (const gp of T.ps) {
      if (gp.st.min <= 0) continue;
      const c0 = po ? 0 : careerPts(gp.p);
      if (c0 && Math.floor((c0 + gp.st.pts) / 5000) > Math.floor(c0 / 5000) && c0 + gp.st.pts >= 10000) { const m = Math.floor((c0 + gp.st.pts) / 5000) * 5000; addNews(S, { type: 'milestone', tids: [T.tid], pids: [gp.pid], h: `${pname(gp.p)} reaches ${m.toLocaleString()} career points`, b: `He got there with ${gp.st.pts} against ${S.teams[sim.T[1 - s].tid].name}.`, imp: m >= 20000 ? 4 : 3, local: T.tid === S.user }); }
      const row = seasonRow(gp.p, S.season, T.tid, po ? 1 : 0);
      row.gp++; if (gp.starter) row.gs++;
      for (const k of LINE_KEYS) row[k] += gp.st[k];
      row.min = Math.round(row.min * 10) / 10;
    }
  }
  for (const tid of [g.h, g.a]) for (const p of roster(S, tid)) {
    if (p.inj && p.inj.games > 0) {
      p.inj.games--;
      if (p.inj.games <= 0) { const long = (p.inj.len || 9) >= 5; p.inj = null; if (tid === S.user && long) inbox(S, { from: `Head Trainer ${staffName(S.teams[tid].staff.trainer)}`, subj: `${pname(p)} cleared to play`, body: `${pname(p)} is healthy and available.` }); if (tid === S.user || !S.teams[tid].autoRot) ensureRotation(S, tid); }
    }
  }
  for (const inj of sim.injuries) {
    const p = P(S, inj.pid);
    p.inj = { type: inj.type, games: inj.games, len: inj.games, d: S.day };
    if (p.tid < 0) continue;
    if (p.tid === S.user && inj.games >= 3) inbox(S, { from: `Head Trainer ${staffName(S.teams[p.tid].staff.trainer)}`, subj: `Injury: ${pname(p)}`, body: `${pname(p)} suffered a ${inj.type.toLowerCase()}. Expected to miss ${inj.games} game${inj.games > 1 ? 's' : ''}.${S.teams[S.user].autoRot ? ' Rotation adjusted automatically.' : ' Check your rotation.'}` });
    if (inj.games >= 8 && (p.ovr >= 78 || p.tid === S.user)) addNews(S, { type: 'injury', tids: [p.tid], pids: [p.pid], h: `${pname(p)} out ${inj.games >= 60 ? 'for the season' : inj.games + ' games'} with ${inj.type.toLowerCase()}`, b: `A tough blow for the ${S.teams[p.tid].name}.`, imp: p.ovr >= 85 ? 3 : 2, local: p.tid === S.user });
    ensureRotation(S, p.tid);
  }
  const H = S.teams[g.h], A = S.teams[g.a];
  const hw = g.hs > g.as;
  if (!po) {
    recUpdate(H, A, hw, g.hs, g.as, true);
    recUpdate(A, H, !hw, g.as, g.hs, false);
    (hw ? H : A).staff.hc.wins++; (hw ? A : H).staff.hc.losses++;
  } else poAfterGame(S, g);
  hypeAfterGame(S, H, hw, Math.abs(g.hs - g.as), po);
  hypeAfterGame(S, A, !hw, Math.abs(g.hs - g.as), po);
  gameFinances(S, g, po);
  gameStories(S, g, sim, po);
  const isUser = g.h === S.user || g.a === S.user;
  const b = sim.box(); b.s = S.season; b.d = S.day; b.po = po; b.h = g.h; b.a = g.a;
  if (!isUser) delete b.shots;
  if (isUser) for (const k in S.box) { const o = S.box[k]; if (o.log && (o.h === S.user || o.a === S.user) && S.day - o.d > 14) { delete o.log; delete o.shots; } }
  if (isUser) b.log = sim.log.filter(e => e.type !== 'sub' || !e.quiet).map(e => [e.q, Math.round(e.clk), e.side, e.text, e.sc[0], e.sc[1], e.type === 'shot' && e.made ? 1 : 0]);
  S.box[g.gid] = b;
}
function recUpdate(t, o, won, pf, pa, home) {
  const r = t.rec;
  if (won) { r.w++; home ? r.hw++ : r.aw++; } else { r.l++; home ? r.hl++ : r.al++; }
  if (t.conf === o.conf) won ? r.cw++ : r.cl++;
  if (t.div === o.div) won ? r.dw++ : r.dl++;
  r.pf += pf; r.pa += pa;
  r.str = won ? (r.str > 0 ? r.str + 1 : 1) : (r.str < 0 ? r.str - 1 : -1);
  r.l10.push(won ? 1 : 0); if (r.l10.length > 10) r.l10.shift();
}
function pruneBoxes(S) {
  for (const gid in S.box) {
    const b = S.box[gid];
    if (b.s !== S.season) { delete S.box[gid]; continue; }
    if (!b.po && b.h !== S.user && b.a !== S.user && S.day - b.d > 3) delete S.box[gid];
  }
}

// one full day: every unplayed game today, then the calendar moves
function simDay(S) {
  if (S.allStar && !S.allStar.finished) return 'allstar';
  if (S.phase !== PH.REG && S.phase !== PH.PO) return 'phase';
  for (const g of todaysGames(S)) if (g.hs == null) playGame(S, g);
  return endDay(S);
}
function endDay(S) {
  if (S.phase === PH.REG) {
    for (const t of S.teams) if (t.tid !== S.user) aiFillRoster(S, t.tid);
    if (S.day % 7 === 0) weekly(S);
    if (S.day === S.deadlineDay) {
      addNews(S, { type: 'league', tids: [], h: 'The trade deadline has passed', b: 'Rosters are set for the stretch run. Free agents can still be signed.', imp: 2 });
      inbox(S, { from: 'League Office', subj: 'Trade deadline passed', body: 'No more trades until after the playoffs. You can still sign free agents.' });
    }
    if (S.day === S.deadlineDay - 3) inbox(S, { from: 'League Office', subj: 'Trade deadline in 3 days', body: `The deadline is after Day ${S.deadlineDay}. Get your deals done.` });
    S.day++;
    pruneBoxes(S);
    if (S.day === S.allStarDay) allStarSelect(S);
    if (seasonOver(S)) { endRegularSeason(S); return 'season-end'; }
    return 'ok';
  }
  if (S.phase === PH.PO) {
    poEndDay(S);
    S.day++;
    if (S.playoffs.champ != null) return 'champ';
    return 'ok';
  }
  return 'phase';
}
function careerPts(p) { let s = 0; for (const r of p.stats) if (!r.po) s += r.pts; return s; }
function playerOfWeek(S) {
  const snap = S.wk || {};
  const next = {};
  const best = [null, null];
  for (const p of S.players) {
    if (p.tid < 0) continue;
    const t = seasonTotals(p, S.season, 0);
    next[p.pid] = [t.gp, t.pts, t.orb + t.drb, t.ast, t.stl + t.blk];
    const o = snap[p.pid] || [0, 0, 0, 0, 0];
    const gp = t.gp - o[0];
    if (gp < 2) continue;
    const recent = p.awards.filter(a => a.t === 'POW' && a.s === S.season && S.day - (a.d || 0) < 28).length;
    const v = ((t.pts - o[1]) + (t.orb + t.drb - o[2]) * 0.7 + (t.ast - o[3]) * 0.8 + (t.stl + t.blk - o[4])) / gp + winPct(S.teams[p.tid].rec) * 4 - recent * 6;
    const c = S.teams[p.tid].conf;
    if (!best[c] || v > best[c].v) best[c] = { p, v, gp, pts: (t.pts - o[1]) / gp, reb: (t.orb + t.drb - o[2]) / gp, ast: (t.ast - o[3]) / gp };
  }
  S.wk = next;
  for (const b of best) {
    if (!b) continue;
    b.p.awards.push({ s: S.season, t: 'POW', d: S.day });
    addNews(S, { type: 'award', tids: [b.p.tid], pids: [b.p.pid], h: `${pname(b.p)} named ${CONFS[S.teams[b.p.tid].conf]} Player of the Week`, b: `${b.pts.toFixed(1)} points, ${b.reb.toFixed(1)} rebounds and ${b.ast.toFixed(1)} assists over ${b.gp} games.`, imp: 2, local: b.p.tid === S.user });
  }
}
function agentCalls(S) {
  if (S.day < 14 || S.day > S.deadlineDay + 20) return;
  for (const p of roster(S, S.user)) {
    if (p.contract.exp !== S.season || p.extAsked === S.season || p.ovr < 72) continue;
    if (Math.random() > 0.25) continue;
    p.extAsked = S.season;
    const a = contractAsk(S, p, p.tid);
    inbox(S, { from: `${pname(p)}'s agent`, subj: `Extension talks for ${pname(p)}?`, body: `My client is in the last year of his deal and would consider an extension in the neighborhood of ${U.money(a.amt)} a year for ${a.yrs} years. ${resignStatus(S, p) === 'willing' ? 'He likes it here.' : 'Frankly, he is curious about the open market.'}`, act: { kind: 'ext', pid: p.pid } });
  }
}
function weekly(S) {
  updateMorale(S);
  if (S.day >= 7) playerOfWeek(S); else S.wk = null;
  agentCalls(S);
  weeklyNews(S);
  radioShow(S);
  tradeBlockOffers(S);
  if (Math.random() < 0.6) aiAiTrade(S);
}

// ---------- All-Star Weekend ----------
function allStarScore(S, p) {
  const t = seasonTotals(p, S.season, 0); if (t.gp < 5) return 0;
  const pg = perGame(t);
  const team = S.teams[p.tid];
  return pg.eff * (0.8 + winPct(team.rec) * 0.4) + pg.ppg * 0.25 + (p.ovr - 75) * 0.15 + Math.log(1 + team.pop) * 0.4 + U.rf(0, 1.5);
}
function allStarSelect(S) {
  const sel = [[], []], starters = [[], []];
  for (const c of [0, 1]) {
    const pool = U.sortBy(S.players.filter(p => p.tid >= 0 && S.teams[p.tid].conf === c && !(p.inj && p.inj.games > 10)), p => allStarScore(S, p));
    const g = pool.filter(p => p.pos === 'PG' || p.pos === 'SG').slice(0, 2);
    const f = pool.filter(p => !g.includes(p) && (p.pos === 'SF' || p.pos === 'PF' || p.pos === 'C')).slice(0, 3);
    starters[c] = g.concat(f).map(p => p.pid);
    const res = pool.filter(p => !starters[c].includes(p.pid)).slice(0, 7);
    sel[c] = starters[c].concat(res.map(p => p.pid));
    for (const pid of sel[c]) P(S, pid).awards.push({ s: S.season, t: 'AS' });
  }
  const all = S.players.filter(p => p.tid >= 0 && !(p.inj && p.inj.games > 0));
  const three = U.sortBy(all, p => p.r.tpt * 1.5 + seasonTotals(p, S.season).tpm / 3 + U.rf(0, 4)).slice(0, 6).map(p => p.pid);
  const dunk = U.sortBy(all.filter(p => p.age <= 29), p => p.r.jmp * 1.4 + p.r.ins * 0.3 + U.rf(0, 12)).slice(0, 4).map(p => p.pid);
  S.allStar = { s: S.season, sel, starters, three, dunk, done: {}, res: {}, finished: false };
  const ut = sel[0].concat(sel[1]).filter(pid => P(S, pid).tid === S.user);
  addNews(S, { type: 'allstar', tids: [], h: 'All-Star rosters announced', b: `East starters: ${starters[0].map(id => pname(P(S, id))).join(', ')}. West starters: ${starters[1].map(id => pname(P(S, id))).join(', ')}.`, imp: 3 });
  if (ut.length) inbox(S, { from: 'League Office', subj: 'All-Star selection', body: `Congratulations: ${ut.map(id => pname(P(S, id))).join(', ')} ${ut.length > 1 ? 'were' : 'was'} named to the All-Star team.` });
}
function allStarGame(S) {
  const A = S.allStar;
  const mins = {};
  const ros = [0, 1].map(c => {
    const ids = A.sel[c].filter(id => { const p = P(S, id); return !p.inj || p.inj.games <= 0; });
    ids.forEach((id, i) => mins[id] = i < 5 ? 26 : 16);
    return { pids: ids, mins, abbr: c === 0 ? 'EAST' : 'WEST', name: c === 0 ? 'East' : 'West' };
  });
  const sim = new GameSim(S, { gid: 0, h: -1, a: -2 }, { allStar: true, rosters: ros });
  return sim;
}
function allStarFinish(S, sim) {
  const A = S.allStar;
  const w = sim.score[0] > sim.score[1] ? 0 : 1;
  const mvp = U.maxBy(sim.T[w].ps, g => g.st.pts + (g.st.orb + g.st.drb) * 0.7 + g.st.ast * 0.8);
  A.res.game = { score: sim.score.slice(), mvp: mvp.pid, box: sim.box() };
  delete A.res.game.box.shots;
  A.done.game = true;
  mvp.p.awards.push({ s: S.season, t: 'ASMVP' });
  addNews(S, { type: 'allstar', tids: [], pids: [mvp.pid], h: `${w === 0 ? 'East' : 'West'} win the All-Star Game ${Math.max(...sim.score)}-${Math.min(...sim.score)}; ${pname(mvp.p)} named MVP`, b: `${pname(mvp.p)} had ${mvp.st.pts} points, ${mvp.st.orb + mvp.st.drb} rebounds and ${mvp.st.ast} assists.`, imp: 3 });
  checkAllStarDone(S);
}
function threeRound(p) {
  // 25 balls: 5 racks, last ball of each is the money ball
  const pm = U.clamp(0.28 + (p.r.tpt - 50) * 0.0095, 0.2, 0.72);
  const racks = [];
  let tot = 0;
  for (let r = 0; r < 5; r++) { const rack = []; for (let b = 0; b < 5; b++) { const m = Math.random() < pm; rack.push(m ? 1 : 0); if (m) tot += b === 4 ? 2 : 1; } racks.push(rack); }
  return { pid: p.pid, racks, tot };
}
function threeContest(S, userScores) {
  // userScores: {pid: {racks, tot}} for rounds played by the user (round 1 / final)
  const A = S.allStar;
  const r1 = A.three.map(id => (userScores && userScores.r1 && userScores.r1[id]) || threeRound(P(S, id)));
  const fin = r1.slice().sort((a, b) => b.tot - a.tot).slice(0, 3);
  const r2 = fin.map(x => (userScores && userScores.r2 && userScores.r2[x.pid]) || threeRound(P(S, x.pid)));
  r2.sort((a, b) => b.tot - a.tot);
  A.res.three = { r1, r2, winner: r2[0].pid };
  A.done.three = true;
  P(S, r2[0].pid).awards.push({ s: S.season, t: '3PT' });
  addNews(S, { type: 'allstar', tids: [P(S, r2[0].pid).tid], pids: [r2[0].pid], h: `${pname(P(S, r2[0].pid))} wins the Three-Point Shootout`, b: `He posted ${r2[0].tot} in the final round.`, imp: 2 });
  checkAllStarDone(S);
}
const DUNKS = ['a windmill from the baseline', 'a 360 reverse jam', 'a between-the-legs slam', 'an off-the-backboard self-alley-oop', 'a two-hand tomahawk over a mascot', 'a free-throw-line takeoff', 'a behind-the-back dunk', 'a cradle rock jam', 'a double-pump reverse', 'an elbow-in-the-rim hang'];
function dunkContest(S) {
  const A = S.allStar;
  const score = p => { const base = 34 + (p.r.jmp - 60) * 0.28 + U.gauss(0, 4.5); return U.clamp(Math.round(base), 28, 50); };
  const r1 = A.dunk.map(id => { const p = P(S, id); const d1 = { dunk: U.pick(DUNKS), s: score(p) }, d2 = { dunk: U.pick(DUNKS), s: score(p) }; return { pid: id, d: [d1, d2], tot: d1.s + d2.s }; });
  const fin = r1.slice().sort((a, b) => b.tot - a.tot).slice(0, 2);
  const r2 = fin.map(x => { const p = P(S, x.pid); const d1 = { dunk: U.pick(DUNKS), s: score(p) }, d2 = { dunk: U.pick(DUNKS), s: score(p) }; return { pid: x.pid, d: [d1, d2], tot: d1.s + d2.s }; });
  if (r2[0].tot === r2[1].tot) r2[0].tot++;
  r2.sort((a, b) => b.tot - a.tot);
  A.res.dunk = { r1, r2, winner: r2[0].pid };
  A.done.dunk = true;
  P(S, r2[0].pid).awards.push({ s: S.season, t: 'DUNK' });
  addNews(S, { type: 'allstar', tids: [P(S, r2[0].pid).tid], pids: [r2[0].pid], h: `${pname(P(S, r2[0].pid))} wins the Slam Dunk Contest`, b: `His clincher: ${r2[0].d[1].dunk} for a ${r2[0].d[1].s}.`, imp: 2 });
  checkAllStarDone(S);
}
function checkAllStarDone(S) { const d = S.allStar.done; if (d.game && d.three && d.dunk) S.allStar.finished = true; }
function allStarAuto(S) {
  if (!S.allStar.done.dunk) dunkContest(S);
  if (!S.allStar.done.three) threeContest(S);
  if (!S.allStar.done.game) { const sim = allStarGame(S); sim.simToEnd(); allStarFinish(S, sim); }
}

// ---------- awards ----------
function computeAwards(S) {
  const G = S.settings.games, season = S.season;
  const rows = S.players.filter(p => p.tid >= 0).map(p => { const t = seasonTotals(p, season, 0); return { p, t, pg: perGame(t), team: S.teams[p.tid] }; }).filter(x => x.t.gp >= G * 0.5);
  const mvpS = x => x.pg.eff * (0.72 + winPct(x.team.rec) * 0.56) + x.pg.ppg * 0.18;
  const dS = x => x.pg.spg * 2.2 + x.pg.bpg * 2.4 + x.pg.rpg * 0.35 + (x.p.r.pdf + x.p.r.idf) / 40 + winPct(x.team.rec) * 3 + x.pg.mpg / 15;
  const byM = U.sortBy(rows, mvpS), byD = U.sortBy(rows, dS);
  const rook = U.sortBy(rows.filter(x => x.p.yrsPro === 0), x => x.pg.eff + x.pg.ppg * 0.3);
  const sixth = U.sortBy(rows.filter(x => x.t.gs < x.t.gp * 0.35), x => x.pg.ppg * 0.6 + x.pg.eff * 0.5);
  const mip = U.sortBy(rows.filter(x => x.p.yrsPro >= 1).map(x => { const prev = seasonTotals(x.p, season - 1, 0); if (prev.gp < G * 0.3) return null; const pp = perGame(prev); return Object.assign({ d: (x.pg.eff - pp.eff) + (x.pg.ppg - pp.ppg) * 0.6 }, x); }).filter(Boolean), x => x.d);
  const teams = (list, n) => {
    const out = []; const used = new Set();
    for (let k = 0; k < n; k++) {
      const team = []; const need = { G: 2, F: 2, C: 1 };
      for (const x of list) {
        if (used.has(x.p.pid)) continue;
        const grp = x.p.pos === 'PG' || x.p.pos === 'SG' ? 'G' : x.p.pos === 'C' ? 'C' : 'F';
        let slot = need[grp] > 0 ? grp : (grp === 'F' && x.p.pos === 'PF' && need.C > 0 ? 'C' : null);
        if (!slot) continue;
        need[slot]--; team.push(x.p.pid); used.add(x.p.pid);
        if (team.length === 5) break;
      }
      out.push(team);
    }
    return out;
  };
  const coy = U.maxBy(S.teams, t => { const prev = t.hist[t.hist.length - 1]; const exp = prev ? prev.w / Math.max(1, prev.w + prev.l) : 0.5; return winPct(t.rec) - exp * 0.7 + winPct(t.rec) * 0.3; });
  const lead = k => { const r = U.maxBy(rows.filter(x => x.t.gp >= G * 0.7), x => x.pg[k]); return r ? r.p.pid : null; };
  const A = {
    mvp: byM[0] && byM[0].p.pid, dpoy: byD[0] && byD[0].p.pid, roy: rook[0] && rook[0].p.pid, smoy: sixth[0] && sixth[0].p.pid, mip: mip[0] && mip[0].p.pid,
    coy: { tid: coy.tid, n: staffName(coy.staff.hc) }, all: teams(byM, 3), alld: teams(byD, 2), allr: rook.slice(0, 5).map(x => x.p.pid),
    lead: { pts: lead('ppg'), reb: lead('rpg'), ast: lead('apg'), stl: lead('spg'), blk: lead('bpg') }, mvpVote: byM.slice(0, 5).map(x => x.p.pid),
  };
  const give = (pid, t) => { if (pid != null) P(S, pid).awards.push({ s: season, t }); };
  give(A.mvp, 'MVP'); give(A.dpoy, 'DPOY'); give(A.roy, 'ROY'); give(A.smoy, '6MOY'); give(A.mip, 'MIP');
  A.all.forEach((tm, i) => tm.forEach(pid => give(pid, 'ALL' + (i + 1)))); A.alld.forEach((tm, i) => tm.forEach(pid => give(pid, 'ALLD' + (i + 1))));
  A.allr.forEach(pid => give(pid, 'ALLR')); give(A.lead.pts, 'SCOR');
  coy.staff.hc.coy = (coy.staff.hc.coy || 0) + 1;
  // season records
  for (const x of rows) {
    pushRecord(S.records.season.ppg, { v: Math.round(x.pg.ppg * 10) / 10, pid: x.p.pid, n: pname(x.p), tid: x.p.tid, s: season });
    pushRecord(S.records.season.rpg, { v: Math.round(x.pg.rpg * 10) / 10, pid: x.p.pid, n: pname(x.p), tid: x.p.tid, s: season });
    pushRecord(S.records.season.apg, { v: Math.round(x.pg.apg * 10) / 10, pid: x.p.pid, n: pname(x.p), tid: x.p.tid, s: season });
  }
  for (const t of S.teams) pushRecord(S.records.team.wins, { v: t.rec.w, l: t.rec.l, tid: t.tid, n: tname(t), s: season, g: G });
  return A;
}
const AWARD_NAMES = { POW: 'Player of the Week', MVP: 'Most Valuable Player', DPOY: 'Defensive Player of the Year', ROY: 'Rookie of the Year', '6MOY': 'Sixth Man of the Year', MIP: 'Most Improved Player', FMVP: 'Finals MVP', ALL1: 'All-League 1st Team', ALL2: 'All-League 2nd Team', ALL3: 'All-League 3rd Team', ALLD1: 'All-Defense 1st Team', ALLD2: 'All-Defense 2nd Team', ALLR: 'All-Rookie Team', AS: 'All-Star', ASMVP: 'All-Star Game MVP', CHAMP: 'Champion', SCOR: 'Scoring Title', '3PT': 'Three-Point Shootout Winner', DUNK: 'Slam Dunk Champion' };

function endRegularSeason(S) {
  S.seasonAwards = computeAwards(S);
  const A = S.seasonAwards;
  const t = S.teams;
  const best = standings(S)[0];
  addNews(S, { type: 'league', tids: [best.tid], h: `Regular season wraps: ${tname(best)} finish with the league's best record (${best.rec.w}-${best.rec.l})`, b: 'The playoff bracket is set.', imp: 3 });
  if (A.mvp != null) { const p = P(S, A.mvp); const pg = perGame(seasonTotals(p, S.season)); addNews(S, { type: 'award', tids: [p.tid], pids: [p.pid], h: `${pname(p)} named league MVP`, b: `${pg.ppg.toFixed(1)} points, ${pg.rpg.toFixed(1)} rebounds and ${pg.apg.toFixed(1)} assists for the ${S.teams[p.tid].name}.`, imp: 5 }); }
  setupPlayoffs(S);
}

// ---------- playoffs ----------
function setupPlayoffs(S) {
  const seeds = [confSeeds(S, 0).slice(0, 8).map(t => t.tid), confSeeds(S, 1).slice(0, 8).map(t => t.tid)];
  const r1 = [];
  for (const c of [0, 1]) { const s = seeds[c]; for (const [a, b] of [[0, 7], [3, 4], [2, 5], [1, 6]]) r1.push({ hi: s[a], lo: s[b], w: [0, 0], g: 0, conf: c, winner: null }); }
  S.playoffs = { seeds, round: 0, rounds: [r1], games: [], champ: null, today: null, todayDay: -1 };
  S.phase = PH.PO; S.day = 1;
  const ut = seeds.flat().indexOf(S.user);
  const t = S.teams[S.user];
  if (ut >= 0) { const c = t.conf, seed = seeds[c].indexOf(S.user) + 1; inbox(S, { from: 'League Office', subj: 'You\'re in the playoffs!', body: `The ${t.name} are the No. ${seed} seed in the ${CONFS[c]}.` }); t.hype = Math.min(100, t.hype + 6); }
  else inbox(S, { from: 'Front Office', subj: 'Season over', body: `The ${t.name} missed the playoffs at ${t.rec.w}-${t.rec.l}. The lottery awaits.` });
}
function seedOf(S, tid) { const PO = S.playoffs; for (const c of [0, 1]) { const i = PO.seeds[c].indexOf(tid); if (i >= 0) return i + 1; } return 99; }
function poToday(S) {
  const PO = S.playoffs;
  if (PO.todayDay === S.day) return PO.today;
  const games = [];
  for (const sr of PO.rounds[PO.round]) {
    if (sr.winner != null) continue;
    const n = sr.g + 1;
    const hiHome = [1, 2, 5, 7].includes(n);
    games.push({ gid: S.nextGid++, day: S.day, h: hiHome ? sr.hi : sr.lo, a: hiHome ? sr.lo : sr.hi, hs: null, as: null, ot: 0, po: true, n, round: PO.round });
  }
  PO.today = games; PO.todayDay = S.day;
  return games;
}
function seriesOf(S, a, b) { return S.playoffs.rounds[S.playoffs.round].find(x => (x.hi === a && x.lo === b) || (x.hi === b && x.lo === a)); }
const ROUND_NAMES = ['First Round', 'Conference Semifinals', 'Conference Finals', 'Finals'];
function poAfterGame(S, g) {
  const PO = S.playoffs;
  const sr = seriesOf(S, g.h, g.a);
  sr.g++;
  const winTid = g.hs > g.as ? g.h : g.a;
  sr.w[winTid === sr.hi ? 0 : 1]++;
  PO.games.push({ gid: g.gid, round: PO.round, h: g.h, a: g.a, hs: g.hs, as: g.as, ot: g.ot, n: g.n });
  if (sr.w[0] === 4 || sr.w[1] === 4) {
    sr.winner = sr.w[0] === 4 ? sr.hi : sr.lo;
    const w = S.teams[sr.winner], l = S.teams[sr.winner === sr.hi ? sr.lo : sr.hi];
    const res = `${Math.max(...sr.w)}-${Math.min(...sr.w)}`;
    if (PO.round < 3) addNews(S, { type: 'playoffs', tids: [w.tid, l.tid], h: `${tname(w)} eliminate ${l.name} ${res} in the ${ROUND_NAMES[PO.round]}`, b: `${seedOf(S, w.tid) > seedOf(S, l.tid) ? 'An upset!' : 'Chalk holds.'} ${w.name} advance.`, imp: 3, local: w.tid === S.user || l.tid === S.user });
  }
}
function poEndDay(S) {
  const PO = S.playoffs;
  const cur = PO.rounds[PO.round];
  if (!cur.every(x => x.winner != null)) return;
  if (PO.round === 3) { PO.champ = cur[0].winner; finishPlayoffs(S); return; }
  const w = cur.map(x => x.winner);
  let next = [];
  if (PO.round < 2) { for (let i = 0; i < w.length; i += 2) next.push(mkSeries(S, w[i], w[i + 1], cur[i].conf)); }
  else next = [mkSeries(S, w[0], w[1], -1)];
  PO.rounds.push(next); PO.round++;
}
function mkSeries(S, a, b, conf) {
  let hiA;
  if (conf >= 0) hiA = seedOf(S, a) < seedOf(S, b);
  else { const ra = S.teams[a].rec, rb = S.teams[b].rec; hiA = winPct(ra) > winPct(rb) || (winPct(ra) === winPct(rb) && Math.random() < 0.5); }
  return { hi: hiA ? a : b, lo: hiA ? b : a, w: [0, 0], g: 0, conf, winner: null };
}
function poRoundReached(S, tid) {
  const PO = S.playoffs; if (!PO) return 0;
  if (PO.champ === tid) return 5;
  let r = 0;
  PO.rounds.forEach((rd, i) => { if (rd.some(x => x.hi === tid || x.lo === tid)) r = i + 1; });
  return r;
}
const PO_RESULT = ['Missed playoffs', 'Lost 1st round', 'Lost conf. semis', 'Lost conf. finals', 'Lost Finals', 'Champions'];
function finishPlayoffs(S) {
  const PO = S.playoffs;
  const champ = S.teams[PO.champ];
  const fin = PO.rounds[3][0];
  const runner = S.teams[fin.winner === fin.hi ? fin.lo : fin.hi];
  // Finals MVP from finals box scores
  const tally = {};
  for (const g of PO.games.filter(x => x.round === 3)) {
    const b = S.box[g.gid]; if (!b) continue;
    for (const T of b.teams) if (T.tid === champ.tid) for (const l of T.ps) { tally[l.pid] = (tally[l.pid] || 0) + l.pts + (l.orb + l.drb) * 0.7 + l.ast * 0.8 + l.stl + l.blk; }
  }
  const fmvp = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0];
  if (fmvp) P(S, +fmvp).awards.push({ s: S.season, t: 'FMVP' });
  for (const p of roster(S, champ.tid)) p.awards.push({ s: S.season, t: 'CHAMP' });
  champ.staff.hc.titles++;
  champ.hype = Math.min(100, champ.hype + 15);
  addNews(S, { type: 'champ', tids: [champ.tid], h: `${tname(champ).toUpperCase()} ARE CHAMPIONS!`, b: `The ${champ.name} beat the ${runner.name} ${Math.max(...fin.w)}-${Math.min(...fin.w)} in the Finals.${fmvp ? ' ' + pname(P(S, +fmvp)) + ' is Finals MVP.' : ''}`, imp: 5 });
  for (const t of S.teams) {
    t.hist.push({ s: S.season, w: t.rec.w, l: t.rec.l, po: poRoundReached(S, t.tid), seed: PO.seeds[t.conf].indexOf(t.tid) + 1, coach: staffName(t.staff.hc) });
  }
  const A = S.seasonAwards || {};
  S.history.push({
    s: S.season, champ: champ.tid, champName: tname(champ), runner: runner.tid, runnerName: tname(runner), series: `${Math.max(...fin.w)}-${Math.min(...fin.w)}`,
    fmvp: fmvp ? +fmvp : null, fmvpN: fmvp ? pname(P(S, +fmvp)) : '', mvp: A.mvp, mvpN: A.mvp != null ? pname(P(S, A.mvp)) : '', roy: A.roy, royN: A.roy != null ? pname(P(S, A.roy)) : '',
    dpoy: A.dpoy, dpoyN: A.dpoy != null ? pname(P(S, A.dpoy)) : '', smoyN: A.smoy != null ? pname(P(S, A.smoy)) : '', mipN: A.mip != null ? pname(P(S, A.mip)) : '', coy: A.coy,
    user: { w: S.teams[S.user].rec.w, l: S.teams[S.user].rec.l, po: poRoundReached(S, S.user) }, best: standings(S)[0].tid,
  });
  closeSeasonBooks(S);
  S.phase = PH.END;
  const ur = poRoundReached(S, S.user);
  inbox(S, { from: 'Front Office', subj: `Season review: ${U.seasonLabel(S.season)}`, body: `Final record ${S.teams[S.user].rec.w}-${S.teams[S.user].rec.l}. ${PO_RESULT[ur]}. Check the Season Review for awards, finances and your offseason plan.` });
}

// ---------- offseason ----------
function hofScore(p) {
  const c = careerTotals(p, 0);
  const aw = t => p.awards.filter(a => a.t === t).length;
  return c.pts / 1000 * 2 + (c.orb + c.drb) / 1000 * 1.1 + c.ast / 1000 * 1.6 + aw('MVP') * 10 + aw('FMVP') * 4 + aw('ALL1') * 4 + (aw('ALL2') + aw('ALL3')) * 2 + aw('AS') * 1.5 + aw('CHAMP') * 1.5 + aw('DPOY') * 3;
}
function startOffseason(S) {
  // progression
  const report = [];
  for (const p of S.players.filter(x => x.tid >= -1)) {
    const t = p.tid >= 0 ? S.teams[p.tid] : null;
    const mpg = p.tid >= 0 ? currentMpg(S, p) : 0;
    const before = p.ovr;
    progressPlayer(p, { coachDev: t ? t.staff.hc.r.dev : 45, facility: t ? t.arena.up.prac : 0, asst: t ? t.staff.asst.r.dev : 45, mpg: mpg || 0 });
    p.hist.push({ s: S.season, ovr: p.ovr, tid: p.tid });
    if (p.tid === S.user) report.push({ pid: p.pid, n: pname(p), pos: p.pos, age: p.age, before, after: p.ovr, pot: p.pot });
  }
  for (const p of S.players.filter(x => x.tid === -2)) { const d = U.ri(0, 3); devPlayer(p, d); p.pot = Math.max(p.pot, p.ovr + 1); }
  normalizeLeague(S);
  for (const r of report) r.after = P(S, r.pid).ovr;
  S.progReport = report.sort((a, b) => (b.after - b.before) - (a.after - a.before));
  // retirements
  const retired = [];
  for (const p of S.players.filter(x => x.tid >= -1)) {
    let pr = 0;
    if (p.age >= 33) pr = 0.06 + (p.age - 33) * 0.14;
    if (p.age >= 30 && p.ovr < 63) pr += 0.3;
    if (p.tid === -1 && p.age >= 27 && p.ovr < 68) pr += 0.4;
    if (p.tid === -1 && (p.faYrs || 0) >= 2) pr += 0.5;
    if (p.age >= 39) pr = 0.95;
    if (p.ovr >= 85 && p.age < 37) pr *= 0.3;
    if (p.tid >= 0 && p.contract.exp > S.season && p.age < 37) pr *= 0.35;
    if (Math.random() < pr) retired.push(p);
  }
  for (const p of retired) retirePlayer(S, p);
  for (const p of S.players) p.faYrs = p.tid === -1 ? (p.faYrs || 0) + 1 : 0;
  // keep the free-agent pool a sane size
  const fas = U.sortBy(S.players.filter(p => p.tid === -1), p => playerWorth(p));
  for (const p of fas.slice(90)) retirePlayer(S, p);
  // hall of fame
  for (const p of S.retired.filter(x => x.hofEligible === S.season)) {
    if (hofScore(p) >= 40) { p.hof = S.season; S.hof.push(p.pid); addNews(S, { type: 'hof', tids: [], pids: [p.pid], h: `${pname(p)} elected to the Hall of Fame`, b: `A career of ${careerTotals(p).pts.toLocaleString()} points and ${p.awards.filter(a => a.t === 'AS').length} All-Star selections.`, imp: 3 }); }
  }
  // staff: AI teams hire and fire
  for (const t of S.teams) {
    const h = t.hist[t.hist.length - 1];
    if (t.tid !== S.user) {
      const bad = h && h.w / Math.max(1, h.w + h.l) < 0.36;
      if ((bad && Math.random() < 0.55) || (t.staff.hc.exp <= S.season && Math.random() < 0.5)) {
        const old = t.staff.hc;
        t.staff.hc = genStaff(S, 'hc', U.gauss(62, 10)); t.staff.hc.exp = S.season + U.ri(2, 4);
        t.strat.pace = t.staff.hc.pace; t.strat.def = t.staff.hc.scheme;
        addNews(S, { type: 'coach', tids: [t.tid], h: `${tname(t)} ${bad ? 'fire' : 'part ways with'} coach ${staffName(old)}`, b: `${staffName(t.staff.hc)} takes over.`, imp: 2 });
      }
      for (const k of ['hc', 'asst', 'trainer', 'scout']) if (t.staff[k].exp <= S.season) t.staff[k].exp = S.season + U.ri(1, 3);
    } else {
      const exp = Object.values(t.staff).filter(s => s.exp <= S.season);
      if (exp.length) inbox(S, { from: 'Front Office', subj: 'Staff contracts expiring', body: `${exp.map(s => staffName(s) + ' (' + STAFF_ROLES[s.role] + ')').join(', ')} ${exp.length > 1 ? 'are' : 'is'} out of contract. Re-sign or replace them on the Staff screen before next season.` });
    }
  }
  S.staffPool = genStaffPool(S);
  for (let i = 0; i < 3; i++) aiAiTrade(S);
  S.tradeBlock = S.tradeBlock.filter(id => { const p = P(S, id); return p && p.tid === S.user; });
  S.offers = [];
  S.phase = PH.LOTTERY;
  return { report: S.progReport, retired };
}
function topMean(S) { return U.avg(U.sortBy(S.players.filter(p => p.tid >= -1), p => p.ovr).slice(0, 60), p => p.ovr); }
// keeps talent levels steady across decades: nudges everyone if the league drifts
function normalizeLeague(S) {
  if (S.ovrTarget == null) return;
  const ps = U.sortBy(S.players.filter(p => p.tid >= -1), p => p.ovr);
  const topM = U.avg(ps.slice(0, 60), p => p.ovr), depM = U.avg(ps.slice(60, 360), p => p.ovr);
  if (S.depTarget == null) S.depTarget = depM;
  const dTop = -(topM - S.ovrTarget) * 0.7, dDep = -(depM - S.depTarget) * 0.7;
  const shiftP = (p, sh) => {
    if (Math.abs(sh) < 0.5) return;
    for (const k in OVR_W[p.pos]) p.r[k] = Math.round(U.clamp(p.r[k] + sh, 15, 99));
    p.ovr = calcOvr(p.r, p.pos);
    p.pot = Math.round(U.clamp(p.pot + sh, 30, 99));
  };
  ps.forEach((p, i) => { const f = i < 60 ? 0 : i < 120 ? (i - 60) / 60 : 1; shiftP(p, dTop * (1 - f) + dDep * f); });
  for (const p of S.players.filter(x => x.tid === -2)) shiftP(p, dDep * 0.5);
}
const STAFF_ROLES = { hc: 'Head Coach', asst: 'Asst. Coach', trainer: 'Head Trainer', scout: 'Head Scout' };
function genStaffPool(S) {
  const pool = [];
  for (const role of ['hc', 'hc', 'hc', 'hc', 'hc', 'asst', 'asst', 'asst', 'asst', 'trainer', 'trainer', 'trainer', 'scout', 'scout', 'scout']) pool.push(genStaff(S, role, U.gauss(58, 14)));
  return pool;
}
function retirePlayer(S, p) {
  const was = p.tid;
  p.retiredTid = was; p.tid = -3; p.retired = S.season; p.hofEligible = S.season + 3;
  S.players = S.players.filter(x => x !== p);
  S.retired.push(p);
  S.tradeBlock = S.tradeBlock.filter(x => x !== p.pid);
  const c = careerTotals(p);
  if (c.pts >= 12000 || p.awards.some(a => a.t === 'MVP') || was === S.user) addNews(S, { type: 'retire', tids: was >= 0 ? [was] : [], pids: [p.pid], h: `${pname(p)} announces his retirement`, b: `${p.yrsPro} seasons, ${c.pts.toLocaleString()} points, ${(c.orb + c.drb).toLocaleString()} rebounds, ${c.ast.toLocaleString()} assists.`, imp: c.pts >= 20000 ? 4 : 2, local: was === S.user });
  // slim down forgettable careers to keep the save small
  if (hofScore(p) < 15 && was !== S.user && !p.awards.length) {
    const reg = careerTotals(p, 0), po = careerTotals(p, 1);
    p.stats = [Object.assign({ s: 0, tid: -1, po: 0 }, reg)];
    if (po.gp) p.stats.push(Object.assign({ s: 0, tid: -1, po: 1 }, po));
    p.hist = []; p.r = null;
  }
}
function toResign(S) {
  S.phase = PH.RESIGN;
  for (const p of roster(S, S.user).filter(x => x.contract.exp <= S.season)) { p.neg = 0; p.askYrs = null; }
  const n = roster(S, S.user).filter(x => x.contract.exp <= S.season).length;
  if (n) inbox(S, { from: 'Front Office', subj: `${n} contract${n > 1 ? 's' : ''} expiring`, body: 'Head to Re-sign Players. Anyone you don\'t sign hits free agency.' });
}
function toFreeAgencyPhase(S) {
  aiResign(S);
  toFreeAgency(S);
  startFA(S);
  S.phase = PH.FA;
  addNews(S, { type: 'fa', tids: [], h: 'Free agency opens', b: `Top names on the market: ${U.sortBy(S.players.filter(p => p.tid === -1), p => p.ovr).slice(0, 4).map(p => pname(p) + ' (' + p.ovr + ')').join(', ')}.`, imp: 3 });
}
function newSeason(S) {
  S.season++;
  S.phase = PH.PRE; S.day = 0;
  S.cap = Math.round(S.cap * U.rf(1.02, 1.055) / 100) * 100;
  S.tax = Math.round(S.cap * 1.246 / 100) * 100; S.mle = Math.round(S.cap * 0.101 / 10) * 10;
  S.minSal = Math.round(S.cap * 0.0081 / 10) * 10; S.maxSal = Math.round(S.cap * 0.35 / 10) * 10;
  for (const p of S.players) {
    p.age++;
    if (p.tid !== -2 && !(p.draft && p.draft.year === S.season)) p.yrsPro++;
    p.prom = null; p.neg = 0; p.noResign = false; p.askYrs = null; p.lastGripe = null; p.campYr = null;
    if (p.contract && p.contract.next) { p.contract.amt = p.contract.next; delete p.contract.next; }
    if (p.tid === -1) { const a = contractAsk(S, p, -1); p.ask = { amt: Math.round(a.amt * 0.85 / 10) * 10, yrs: a.yrs, base: a.amt }; p.contract = { amt: p.ask.amt, exp: S.season }; }
  }
  for (const p of S.players.filter(x => x.tid === -2 && x.yrsPro > 0)) p.yrsPro = 0;
  for (const t of S.teams) {
    t.rec = newRec(); t.mle = false; t.dead = t.dead.filter(d => d.exp >= S.season);
    for (const k of ['hc', 'asst', 'trainer', 'scout']) {
      const st = t.staff[k];
      if (st.exp < S.season) {
        if (t.tid === S.user) { t.staff[k] = genStaff(S, k, U.gauss(45, 8)); t.staff[k].exp = S.season; inbox(S, { from: 'Front Office', subj: `Interim ${STAFF_ROLES[k]} named`, body: `${staffName(st)} left when his contract expired. ${staffName(t.staff[k])} is the interim ${STAFF_ROLES[k].toLowerCase()} on a one-year deal.` }); }
        else st.exp = S.season + U.ri(1, 3);
      }
    }
    if (t.tid !== S.user) { aiTrimRoster(S, t.tid); aiFillRoster(S, t.tid); }
    ensureRotation(S, t.tid);
  }
  finishArenas(S);
  seasonMaintenance(S);
  genSchedule(S);
  genPicks(S);
  genDraftClass(S, S.season + 2);
  S.scout = { pts: scoutPoints(S), max: scoutPoints(S) };
  S.camp = { left: 4, log: [] };
  S.box = {}; S.allStar = null; S.seasonAwards = null; S.playoffs = null; S.lottery = null; S.draft = null; S.power = null; S.progReport = null;
  for (const t of S.teams) initFinances(S, t);
  const ut = S.teams[S.user];
  addNews(S, { type: 'league', tids: [], h: `Training camps open for the ${U.seasonLabel(S.season)} season`, b: `The salary cap is ${U.money(S.cap)}, the luxury tax line ${U.money(S.tax)}.`, imp: 2 });
  inbox(S, { from: `Coach ${staffName(ut.staff.hc)}`, subj: 'Welcome to camp', body: `We've got ${S.camp.left} training camp sessions before the opener. Pick your guys and drills — young players get the most out of it.` });
  radioShow(S);
}
function startRegularSeason(S) {
  S.phase = PH.REG; S.day = 1;
  for (const t of S.teams) { if (t.tid !== S.user) { aiTrimRoster(S, t.tid); aiFillRoster(S, t.tid); } ensureRotation(S, t.tid); }
  powerRankings(S);
  addNews(S, { type: 'league', tids: [], h: `Opening night: the ${U.seasonLabel(S.season)} season tips off`, b: `Preseason favorites: ${S.power.slice(0, 3).map(x => tname(S.teams[x.tid])).join(', ')}.`, imp: 3 });
}
function userRosterIssues(S) {
  const n = roster(S, S.user).length;
  const iss = [];
  if (n > ROSTER_MAX) iss.push(`You have ${n} players. Release or trade down to ${ROSTER_MAX}.`);
  if (n < ROSTER_MIN) iss.push(`You have ${n} players. Sign free agents to reach ${ROSTER_MIN}.`);
  return iss;
}

// ---------- training camp ----------
const DRILLS = {
  shoot: { n: 'Shooting Clinic', keys: ['mid', 'tpt', 'ft'], game: 'shoot', d: 'Timing drill. Boosts mid-range, three-point and free throw.' },
  handle: { n: 'Ball-Handling Gauntlet', keys: ['bhd', 'pas', 'iq'], game: 'handle', d: 'Combo-input drill. Boosts handling, passing and IQ.' },
  defense: { n: 'Defensive Slides', keys: ['pdf', 'stl', 'spd'], game: 'defense', d: 'Stay in front of the ball. Boosts perimeter D, steals and speed.' },
  post: { n: 'Post Moves', keys: ['ins', 'str', 'idf'], game: null, d: 'Simulated drill. Boosts inside scoring, strength and interior D.' },
  boards: { n: 'Rebounding Drill', keys: ['orb', 'drb', 'blk'], game: null, d: 'Simulated drill. Boosts rebounding and shot blocking.' },
  cond: { n: 'Conditioning', keys: ['sta', 'dur', 'jmp'], game: null, d: 'Simulated drill. Boosts stamina, durability and vertical.' },
};
function campSimGrade(S, p) { return U.clamp(Math.round(U.gauss(55 + (p.r.iq - 55) * 0.3 + (p.pers === 'gymrat' ? 8 : 0), 14)), 5, 98); }
function campApply(S, pid, drill, grade) {
  const p = P(S, pid);
  if (!S.camp || S.camp.left <= 0) return null;
  const ageF = p.age <= 22 ? 1.3 : p.age <= 26 ? 1.0 : p.age <= 30 ? 0.7 : 0.45;
  const base = (grade - 35) / 18 * ageF * (1 + S.teams[S.user].staff.asst.r.dev / 400);
  const gains = {};
  for (const k of DRILLS[drill].keys) { const g = Math.max(0, Math.round(base + U.rf(-0.6, 0.6))); p.r[k] = Math.min(99, p.r[k] + g); gains[k] = g; }
  const before = p.ovr; p.ovr = calcOvr(p.r, p.pos); if (p.pot < p.ovr) p.pot = p.ovr;
  p.campYr = S.season;
  S.camp.left--;
  const res = { pid, n: pname(p), drill, grade, gains, d: p.ovr - before };
  S.camp.log.push(res);
  return res;
}

// ===== ui/base.js — app state, router, shell, shared widgets =====
const App = { S: null, slot: null, route: 'title', params: {}, ui: { sort: {}, tab: {}, navOpen: false }, modal: null, game: null, simStop: false };
const Screens = {};
const Act = {};
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const E = U.esc;

function go(route, params = {}) {
  if (App.game && App.game.running && route !== 'game') App.game.pause();
  App.route = route; App.params = params; App.ui.navOpen = false;
  render();
  window.scrollTo(0, 0);
}
function render() {
  const root = $('#app');
  const scr = Screens[App.route] || Screens.home;
  if (!App.S || scr.bare) { root.innerHTML = scr.render(App.params); }
  else {
    applyTeamTheme();
    root.innerHTML = shell(scr.render(App.params), App.route);
  }
  if (scr.after) scr.after(App.params);
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }
function applyTeamTheme() {
  const t = App.S.teams[App.S.user];
  const r = document.documentElement.style;
  r.setProperty('--team', t.c1); r.setProperty('--team2', t.c2); r.setProperty('--teamtext', textOn(t.c1));
}
function lum(hex) { const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) / 255; }
function textOn(hex) { return lum(hex) > 0.62 ? '#14110a' : '#ffffff'; }

// ---------- shared widgets ----------
function logo(t, size = 36) {
  if (!t) return '';
  const c1 = t.c1, c2 = t.c2, tx = textOn(c1), s = size;
  const shape = t.tid % 4;
  const ab = E(t.abbr);
  const fs = ab.length >= 3 ? 30 : 36;
  let body;
  if (shape === 0) body = `<circle cx="50" cy="50" r="46" fill="${c2}"/><circle cx="50" cy="50" r="39" fill="${c1}"/><path d="M11 58 L89 42 L89 50 L11 66Z" fill="${c2}" opacity=".35"/>`;
  else if (shape === 1) body = `<path d="M50 4 L92 16 L88 62 Q80 84 50 96 Q20 84 12 62 L8 16Z" fill="${c2}"/><path d="M50 12 L84 22 L80 60 Q73 78 50 88 Q27 78 20 60 L16 22Z" fill="${c1}"/>`;
  else if (shape === 2) body = `<path d="M50 3 L91 26 L91 74 L50 97 L9 74 L9 26Z" fill="${c2}"/><path d="M50 11 L84 30 L84 70 L50 89 L16 70 L16 30Z" fill="${c1}"/>`;
  else body = `<rect x="14" y="14" width="72" height="72" rx="10" transform="rotate(45 50 50)" fill="${c2}"/><rect x="21" y="21" width="58" height="58" rx="7" transform="rotate(45 50 50)" fill="${c1}"/>`;
  return `<svg class="logo" width="${s}" height="${s}" viewBox="0 0 100 100" aria-label="${E(tname(t))} logo">${body}<text x="50" y="51" text-anchor="middle" dominant-baseline="central" font-family="Saira Condensed, Arial Narrow, sans-serif" font-weight="800" font-style="italic" font-size="${fs}" fill="${tx}" stroke="${c2}" stroke-width="0.6">${ab}</text></svg>`;
}
function rt(v) { const c = v >= 90 ? 'r9' : v >= 80 ? 'r8' : v >= 70 ? 'r7' : v >= 60 ? 'r6' : 'r5'; return `<span class="rt ${c}">${v}</span>`; }
function gradeChip(g) { const c = g[0] === 'A' ? 'r9' : g[0] === 'B' ? 'r8' : g[0] === 'C' ? 'r7' : 'r5'; return `<span class="rt ${c}">${g}</span>`; }
function plink(p, short) { if (!p) return '—'; return `<a class="pl" data-a="player" data-id="${p.pid}">${E(short ? pshort(p) : pname(p))}</a>`; }
function tlink(t, full) { return `<a class="pl" data-a="go" data-r="team" data-tid="${t.tid}">${E(full ? tname(t) : t.abbr)}</a>`; }
function rec(t) { return `${t.rec.w}-${t.rec.l}`; }
function moodIcon(m) { const c = m >= 65 ? 'good' : m >= 40 ? 'warn' : 'bad'; return `<span class="chip ${c}" title="${moodWord(m)} (${Math.round(m)})">${m >= 65 ? '▲' : m >= 40 ? '●' : '▼'} ${moodWord(m)}</span>`; }
function injChip(p) { return p.inj && p.inj.games > 0 ? `<span class="chip bad" title="${E(p.inj.type)}">INJ ${p.inj.games}g</span>` : ''; }
function contractStr(S, p) { if (p.tid < 0) return '—'; const yrs = p.contract.exp - S.season + (offseason(S) ? 0 : 1); return `${U.money(p.contract.amt)} <span class="mute">× ${Math.max(0, yrs)}</span>`; }
function potStr(S, p) { return gradeChip(potGrade(Math.max(p.pot, p.ovr))); }
function streakStr(t) { const s = t.rec.str; return s === 0 ? '—' : (s > 0 ? 'W' : 'L') + Math.abs(s); }
function phaseLine(S) {
  if (S.phase === PH.REG) return `${U.seasonLabel(S.season)} · Day ${S.day}`;
  if (S.phase === PH.PO) return `${U.seasonLabel(S.season)} · ${ROUND_NAMES[S.playoffs.round]}`;
  if (S.phase === PH.FA && S.fa) return `${U.seasonLabel(S.season)} offseason · FA Day ${S.fa.day}/${S.fa.days}`;
  return `${U.seasonLabel(S.season)} · ${PH_NAME[S.phase]}`;
}
function sortTable(id, cols, rows, opts = {}) {
  const st = App.ui.sort[id] || opts.sort || {};
  if (st.k) {
    const col = cols.find(c => c.k === st.k);
    if (col) { const f = col.s || (r => r[col.k]); rows = rows.slice().sort((a, b) => { const x = f(a), y = f(b); return (typeof x === 'string' ? x.localeCompare(y) : x - y) * (st.d ? -1 : 1); }); }
  }
  const th = cols.map(c => `<th class="${c.n ? 'n' : ''} ${c.c ? 'c' : ''} ${c.k && c.sort !== false ? 's' : ''} ${st.k && st.k === c.k ? 'sorted' : ''}" ${c.k && c.sort !== false ? `data-a="sort" data-t="${id}" data-k="${c.k}"` : ''} title="${E(c.tip || '')}">${c.l}${st.k && st.k === c.k ? (st.d ? ' ▾' : ' ▴') : ''}</th>`).join('');
  const body = rows.map(r => `<tr class="${opts.rowCls ? opts.rowCls(r) : ''}">${cols.map(c => `<td class="${c.n ? 'n' : ''} ${c.c ? 'c' : ''}">${c.f ? c.f(r) : E(r[c.k])}</td>`).join('')}</tr>`).join('');
  return `<div class="tw"${opts.maxh ? ` style="max-height:${opts.maxh}px;overflow-y:auto"` : ''}><table class="t"><thead><tr>${th}</tr></thead><tbody>${body || `<tr><td colspan="${cols.length}" class="empty">${opts.empty || 'Nothing here yet.'}</td></tr>`}</tbody></table></div>`;
}
Act.sort = el => {
  const id = el.dataset.t, k = el.dataset.k;
  const cur = App.ui.sort[id] || {};
  App.ui.sort[id] = { k, d: cur.k === k ? !cur.d : true };
  rerender();
};
function tabs(id, list, def) {
  const cur = App.ui.tab[id] || def || list[0][0];
  return { cur, html: `<div class="tabs" role="tablist">${list.map(([k, l]) => `<button role="tab" class="${cur === k ? 'on' : ''}" data-a="tab" data-t="${id}" data-k="${k}">${l}</button>`).join('')}</div>` };
}
Act.tab = el => { App.ui.tab[el.dataset.t] = el.dataset.k; rerender(); };
function seg(id, list, cur, act) { return `<div class="seg">${list.map(([k, l]) => `<button class="${String(cur) === String(k) ? 'on' : ''}" data-a="${act}" data-t="${id}" data-k="${k}">${l}</button>`).join('')}</div>`; }
function panel(title, body, opts = {}) { return `<section class="panel ${opts.cls || ''}"${opts.style ? ` style="${opts.style}"` : ''}><div class="hd"><h3>${title}</h3>${opts.x ? `<div class="x">${opts.x}</div>` : ''}</div><div class="bd ${opts.flush ? 'flush' : ''}">${body}</div></section>`; }
function pageHead(title, sub, acts) { return `<div class="ph"><h1><span class="sl">/</span>${title}</h1>${sub ? `<div class="sub">${sub}</div>` : ''}${acts ? `<div class="acts row">${acts}</div>` : ''}</div>`; }
function btn(label, act, cls = '', data = {}) { return `<button class="btn ${cls}" data-a="${act}" ${Object.entries(data).map(([k, v]) => `data-${k}="${E(v)}"`).join(' ')}><span>${label}</span></button>`; }

// ---------- toasts, modals, busy ----------
function toast(msg, kind) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + (kind || '');
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 320); }, kind === 'bad' ? 4200 : 3000);
}
function modal(title, body, foot, opts = {}) {
  App.modal = { title, body, foot, opts };
  const el = $('#modal');
  el.innerHTML = `<div class="ovl" data-a="${opts.sticky ? '' : 'modalBg'}"><div class="modal ${opts.size || ''}" role="dialog" aria-modal="true" aria-label="${E(typeof title === 'string' ? title.replace(/<[^>]+>/g, '') : '')}"><div class="mh"><h2>${title}</h2>${opts.sticky ? '' : '<button class="xbtn" data-a="closeModal" aria-label="Close">×</button>'}</div><div class="mb">${body}</div>${foot ? `<div class="mf">${foot}</div>` : ''}</div></div>`;
  if (opts.after) opts.after(el);
}
function closeModal() { $('#modal').innerHTML = ''; const m = App.modal; App.modal = null; if (m && m.opts.onClose) m.opts.onClose(); }
Act.closeModal = () => closeModal();
Act.modalBg = (el, e) => { if (e.target === el) closeModal(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && App.modal && !App.modal.opts.sticky && !App.mg) closeModal(); });
let confirmCb = null;
function confirmBox(title, text, ok, cb, cls = 'gold') {
  confirmCb = cb;
  modal(title, `<p>${text}</p>`, `${btn('Cancel', 'closeModal', 'ghost')}${btn(ok, 'confirmOk', cls)}`, { size: 'sm' });
}
Act.confirmOk = () => { const cb = confirmCb; confirmCb = null; closeModal(); if (cb) cb(); };
function busy(title, sub, stoppable) {
  const el = $('#busy');
  if (!title) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="busy"><div class="box"><div class="t">${title}</div><div class="mute" id="busySub">${sub || ''}</div>${stoppable ? `<div style="margin-top:14px">${btn('Stop', 'simStop', 'sm')}</div>` : ''}</div></div>`;
}
function busySub(text) { const el = $('#busySub'); if (el) el.textContent = text; }
Act.simStop = () => { App.simStop = true; busySub('Stopping…'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- navigation & delegation ----------
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || !el.dataset.a) return;
  const fn = Act[el.dataset.a];
  if (fn) { if (el.tagName === 'A' || el.tagName === 'BUTTON') e.preventDefault(); fn(el, e); }
});
document.addEventListener('change', e => { const el = e.target.closest('[data-c]'); if (el && Act[el.dataset.c]) Act[el.dataset.c](el, e); });
document.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if (el && Act[el.dataset.i]) Act[el.dataset.i](el, e); });
Act.go = el => { const p = Object.assign({}, el.dataset); delete p.a; const r = p.r; delete p.r; for (const k in p) if (/^-?\d+$/.test(p[k])) p[k] = +p[k]; go(r, p); };
Act.burger = () => { App.ui.navOpen = !App.ui.navOpen; const n = $('.nav'); if (n) n.classList.toggle('open', App.ui.navOpen); };

function navLinks(S, route) {
  const t = S.teams[S.user];
  const ph = S.phase;
  const un = unread(S);
  const L = (r, label, extra = '', params = '') => `<a href="#" data-a="go" data-r="${r}" ${params} class="${route === r ? 'on' : ''}">${label}${extra}</a>`;
  const exp = roster(S, S.user).filter(p => p.contract.exp <= S.season).length;
  return `
  <h6>Franchise</h6>
  ${L('home', 'Franchise Central')}
  ${L('inbox', 'Inbox', un ? `<span class="badge">${un}</span>` : '')}
  ${L('news', 'Newsroom')}
  <h6>My Team</h6>
  ${L('roster', 'Roster')}
  ${L('rotation', 'Rotation &amp; Strategy')}
  ${L('schedule', 'Schedule')}
  ${S.fdraft && !S.fdraft.done ? L('fdraft', 'Fantasy Draft', '<span class="badge" style="background:var(--gold);color:#000">LIVE</span>') : ''}
  ${ph === PH.PRE ? L('camp', 'Training Camp', S.camp && S.camp.left ? `<span class="badge" style="background:var(--gold);color:#000">${S.camp.left}</span>` : '') : ''}
  <h6>League</h6>
  ${L('standings', 'Standings')}
  ${L('stats', 'Stats &amp; Leaders')}
  ${S.playoffs ? L('playoffs', 'Playoffs') : ''}
  ${S.allStar ? L('allstar', 'All-Star Weekend', !S.allStar.finished ? '<span class="badge" style="background:var(--gold);color:#000">!</span>' : '') : ''}
  ${L('history', 'History &amp; Records')}
  <h6>Front Office</h6>
  ${L('trade', 'Trade Center', S.offers.length ? `<span class="badge">${S.offers.length}</span>` : '')}
  ${L('fa', 'Free Agents', ph === PH.FA ? '<span class="badge" style="background:var(--gold);color:#000">LIVE</span>' : '')}
  ${ph === PH.RESIGN ? L('resign', 'Re-sign Players', exp ? `<span class="badge">${exp}</span>` : '') : ''}
  ${L('draft', ph === PH.DRAFT ? 'Draft Room' : 'Draft &amp; Scouting', ph === PH.DRAFT ? '<span class="badge" style="background:var(--gold);color:#000">LIVE</span>' : '')}
  <h6>Owner's Box</h6>
  ${L('owner', 'Finances')}
  ${L('tickets', 'Tickets &amp; Pricing')}
  ${L('arena', 'Arena')}
  ${L('staff', 'Staff')}
  ${offseason(S) ? L('relocate', 'Relocation') : ''}
  <h6>Game</h6>
  ${L('save', 'Save / Load')}
  ${L('help', 'How to Play')}`;
}
function tickerItems(S) {
  const items = [];
  const day = S.phase === PH.REG ? S.day - 1 : null;
  if (S.phase === PH.REG) {
    const games = S.sched.filter(g => g.day === day && g.hs != null);
    for (const g of games) { const H = S.teams[g.h], A = S.teams[g.a]; items.push(`<span><b>${A.abbr}</b> ${g.as} @ <b>${H.abbr}</b> ${g.hs}${g.ot ? ' (OT)' : ''} · Final</span>`); }
  }
  if (S.playoffs) for (const sr of S.playoffs.rounds[S.playoffs.round] || []) items.push(`<span><b>${S.teams[sr.hi].abbr}</b> ${sr.w[0]} – ${sr.w[1]} <b>${S.teams[sr.lo].abbr}</b></span>`);
  for (const n of S.news.slice(0, 10)) items.push(`<span>${E(n.h)}</span>`);
  return items.join('<span class="dim">◆</span>') || `<span>Welcome to the ${LEAGUE.name}.</span>`;
}
function shell(content, route) {
  const S = App.S, t = S.teams[S.user];
  const adv = advanceInfo(S);
  const room = capSpace(S, S.user);
  return `<div class="shell">
  <header class="topbar">
    <button class="burger" data-a="burger" aria-label="Menu"><span></span><span></span><span></span></button>
    <div class="brand" data-a="go" data-r="home">${logo(t, 42)}<div style="min-width:0"><div class="tn">${E(t.region)} ${E(t.name)}</div><div class="ts">${rec(t)} · ${phaseLine(S)}</div></div></div>
    <div class="topstats">
      <div class="tstat hide-m"><span class="k">Cash</span><span class="v ${t.cash < 0 ? 'bad' : ''}">${U.money(t.cash)}</span></div>
      <div class="tstat hide-m"><span class="k">Cap room</span><span class="v ${room < 0 ? 'bad' : 'good'}">${U.money(room)}</span></div>
      <div class="tstat"><span class="k">Hype</span><span class="v">${Math.round(t.hype)}</span></div>
      ${adv ? `<button class="btn gold" data-a="${adv.act}"><span>${adv.label}</span></button>` : ''}
    </div>
  </header>
  <nav class="nav ${App.ui.navOpen ? 'open' : ''}" aria-label="Main">${navLinks(S, route)}</nav>
  <main class="main">${content}</main>
  <div class="ticker" aria-label="News ticker"><div class="tag">${LEAGUE.abbr} WIRE</div><div class="track"><div class="crawl">${tickerItems(S)}</div></div></div>
  </div>`;
}

// ===== ui/flow.js — saving, simming, phase advancement =====
const Store = {
  db: null, mode: 'idb',
  open() {
    return new Promise(res => {
      try {
        const rq = indexedDB.open('hardwood-franchise', 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore('saves');
        rq.onsuccess = () => { this.db = rq.result; res(true); };
        rq.onerror = () => { this.mode = 'ls'; res(false); };
        rq.onblocked = () => { this.mode = 'ls'; res(false); };
        setTimeout(() => { if (!this.db) { this.mode = 'ls'; res(false); } }, 2500);
      } catch (e) { this.mode = 'ls'; res(false); }
    });
  },
  tx(mode, fn) {
    return new Promise((res, rej) => {
      try { const t = this.db.transaction('saves', mode); const st = t.objectStore('saves'); const r = fn(st); t.oncomplete = () => res(r && r.result); t.onerror = () => rej(t.error); } catch (e) { rej(e); }
    });
  },
  async put(key, val) {
    if (this.mode === 'idb' && this.db) { await this.tx('readwrite', st => st.put(val, key)); return true; }
    try { localStorage.setItem('hwf:' + key, JSON.stringify(val)); return true; } catch (e) { return false; }
  },
  async get(key) {
    if (this.mode === 'idb' && this.db) { return new Promise(res => { try { const r = this.db.transaction('saves').objectStore('saves').get(key); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); } }); }
    try { const v = localStorage.getItem('hwf:' + key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  },
  async del(key) {
    if (this.mode === 'idb' && this.db) { await this.tx('readwrite', st => st.delete(key)); return; }
    try { localStorage.removeItem('hwf:' + key); } catch (e) { }
  },
  async metas() {
    const m = await this.get('__index');
    return Array.isArray(m) ? m : [];
  },
};
function saveMeta(S, key) {
  const t = S.teams[S.user];
  return { key, team: tname(t), abbr: t.abbr, tid: t.tid, c1: t.c1, c2: t.c2, season: S.season, phase: S.phase, phaseLine: phaseLine(S), w: t.rec.w, l: t.rec.l, owner: S.ownerName, ts: Date.now(), titles: S.history.filter(h => h.champ === S.user).length };
}
let saveTimer = null, saving = false;
async function saveNow(quiet) {
  if (!App.S || !App.slot) return;
  if (saving) { autosave(); return; }
  saving = true;
  try {
    const data = JSON.parse(JSON.stringify(App.S));
    const ok = await Store.put(App.slot, data);
    const idx = (await Store.metas()).filter(m => m.key !== App.slot);
    idx.unshift(saveMeta(App.S, App.slot));
    await Store.put('__index', idx);
    if (!quiet) toast(ok ? 'Franchise saved.' : 'Save failed — export a backup from Save / Load.', ok ? 'good' : 'bad');
  } catch (e) { toast('Save failed: ' + e.message, 'bad'); }
  saving = false;
}
function autosave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveNow(true), 800); }
async function loadSlot(key) {
  const data = await Store.get(key);
  if (!data) { toast('That save could not be found.', 'bad'); return false; }
  startWith(data, key);
  return true;
}
function resetTransient() { App.game = null; App.trade = null; App.neg = null; App.fo = null; App.cap = null; App.relo = null; App.ui.campPid = null; App.ui.statPO = 0; App.lotShown = null; App.mg = null; closeModal(); }
function startWith(S, key) {
  resetTransient();
  migrate(S);
  App.S = S; App.slot = key;
  reindex(S);
  go('home');
}
function migrate(S) {
  S.retired = S.retired || []; S.offers = S.offers || []; S.tradeBlock = S.tradeBlock || []; S.hof = S.hof || [];
  for (const t of S.teams) { if (!t.fin) initFinances(S, t); t.dead = t.dead || []; }
}

// ---------- advance button ----------
function advanceInfo(S) {
  switch (S.phase) {
    case PH.PRE: return S.fdraft && !S.fdraft.done ? { label: 'Fantasy Draft ▸', act: 'goFD' } : { label: 'Start Season ▸', act: 'advStart' };
    case PH.REG:
    case PH.PO:
      if (S.allStar && !S.allStar.finished) return { label: 'All-Star Weekend ▸', act: 'goAllStar' };
      if (userGameToday(S)) return { label: 'Game Day ▸', act: 'gameDay' };
      return { label: 'Sim Day ▸', act: 'simDay1' };
    case PH.END: return { label: 'Begin Offseason ▸', act: 'advOffseason' };
    case PH.LOTTERY: return { label: 'Draft Lottery ▸', act: 'goLottery' };
    case PH.DRAFT: return S.draft && S.draft.done ? { label: 'Re-sign Players ▸', act: 'advResign' } : { label: 'Draft Room ▸', act: 'goDraft' };
    case PH.RESIGN: return { label: 'Open Free Agency ▸', act: 'advFA' };
    case PH.FA: return S.fa && S.fa.day <= S.fa.days ? { label: `Next FA Day (${S.fa.day}/${S.fa.days}) ▸`, act: 'faNext' } : { label: 'Finish Free Agency ▸', act: 'faNext' };
  }
  return null;
}
Act.goAllStar = () => go('allstar');
Act.goFD = () => go('fdraft');
Act.gameDay = () => go('game');
Act.simDay1 = () => simDays(1);
Act.simN = el => simDays(+el.dataset.n, { stopAtUserGame: el.dataset.stop === '1' });
Act.simTo = el => {
  const S = App.S, k = el.dataset.k;
  if (k === 'next') simDays(400, { stopAtUserGame: true, skipFirst: true });
  else if (k === 'allstar') simDays(400, { untilDay: S.allStarDay });
  else if (k === 'deadline') simDays(400, { untilDay: S.deadlineDay + 1 });
  else if (k === 'end') simDays(400, { untilPhase: true });
  else if (k === 'round') simDays(60, { untilRound: S.playoffs ? S.playoffs.round + 1 : 0 });
  else if (k === 'po') simDays(200, { untilPhase: true });
};
async function simDays(n, o = {}) {
  const S = App.S;
  if (App.game && !App.game.applied && !App.game.o.allstar && !App.game.finished) { toast('Finish the game in progress first.', 'bad'); go('game'); return; }
  if (App.game && App.game.finished && !App.game.applied && !App.game.o.allstar) { Act.gvContinue(); return; }
  if (S.phase !== PH.REG && S.phase !== PH.PO) return;
  const healthy = roster(S, S.user).filter(p => !p.inj || p.inj.games <= 0).length;
  if (healthy < 5) { toast('You need at least 5 healthy players. Sign a free agent.', 'bad'); go('fa'); return; }
  App.simStop = false;
  busy('Simulating', phaseLine(S), n > 1);
  await sleep(20);
  let i = 0, res = 'ok';
  const ph0 = S.phase;
  while (i < n && !App.simStop) {
    if (S.phase !== PH.REG && S.phase !== PH.PO) break;
    if (S.allStar && !S.allStar.finished) break;
    if (o.stopAtUserGame && userGameToday(S) && !(o.skipFirst && i === 0)) break;
    if (o.untilDay && S.phase === PH.REG && S.day >= o.untilDay) break;
    if (o.untilRound != null && S.playoffs && S.playoffs.round >= o.untilRound) break;
    if (o.untilPhase && S.phase !== ph0) break;
    res = simDay(S);
    i++;
    busySub(phaseLine(S));
    if (res === 'champ') break;
    if (res === 'season-end' && !o.untilPhase) break;
    if (res === 'season-end' && o.untilPhase) break;
    if (i % 2 === 0) await sleep(0);
  }
  busy(null);
  autosave();
  if (S.phase === PH.END) { go('review'); return; }
  if (res === 'season-end') { toast('Regular season complete — the playoffs are set!', 'good'); go('playoffs'); return; }
  if (S.allStar && !S.allStar.finished) { toast('All-Star Weekend has arrived.', 'good'); go('allstar'); return; }
  rerender();
  if (i === 1 && App.route === 'home') {
    const g = S.sched.filter(x => x.day === S.day - 1 && (x.h === S.user || x.a === S.user))[0];
    if (g && g.hs != null) { const won = (g.h === S.user) === (g.hs > g.as); toast(`${won ? 'W' : 'L'} ${g.h === S.user ? 'vs' : '@'} ${S.teams[g.h === S.user ? g.a : g.h].abbr}, ${Math.max(g.hs, g.as)}-${Math.min(g.hs, g.as)}`, won ? 'good' : 'bad'); }
  }
}

Act.advStart = () => {
  const S = App.S;
  if (S.fdraft && !S.fdraft.done) { go('fdraft'); return; }
  const iss = userRosterIssues(S);
  if (iss.length) { modal('Roster problem', `<p>${iss.join('<br>')}</p>`, `${btn('Roster', 'go', '', { r: 'roster' })}${btn('Free Agents', 'go', 'gold', { r: 'fa' })}`, { size: 'sm' }); return; }
  const doit = () => { startRegularSeason(S); autosave(); toast(`The ${U.seasonLabel(S.season)} season is underway!`, 'good'); go('home'); };
  if (S.camp && S.camp.left > 0) confirmBox('Skip camp sessions?', `You still have ${S.camp.left} training camp session${S.camp.left > 1 ? 's' : ''} left. They'll be lost once the season starts.`, 'Start Season', doit);
  else doit();
};
Act.advOffseason = () => {
  const S = App.S;
  busy('Offseason', 'Players age, develop and retire…');
  setTimeout(() => { startOffseason(S); busy(null); autosave(); go('progress'); }, 30);
};
Act.goLottery = () => go('lottery');
Act.goDraft = () => go('draft');
Act.advResign = () => { const S = App.S; finishDraft(S); toResign(S); autosave(); go('resign'); };
Act.advFA = () => {
  const S = App.S;
  const left = roster(S, S.user).filter(p => p.contract.exp <= S.season);
  const doit = () => { toFreeAgencyPhase(S); autosave(); go('fa'); };
  if (left.length) confirmBox('Open free agency?', `${left.map(p => pname(p)).join(', ')} will become free agent${left.length > 1 ? 's' : ''}. You can still bid on them in free agency, but other teams can too.`, 'Open Free Agency', doit);
  else doit();
};
Act.faNext = () => {
  const S = App.S;
  if (S.fa.day <= S.fa.days) {
    const before = new Set(S.players.filter(p => p.tid === -1).map(p => p.pid));
    const signed = faAdvanceDay(S);
    const mine = signed.filter(p => p.tid === S.user);
    const big = signed.filter(p => p.ovr >= 78 && p.tid !== S.user).slice(0, 3);
    if (mine.length) toast(`${mine.map(p => pname(p)).join(', ')} signed with you!`, 'good');
    else if (big.length) toast(`Signed elsewhere: ${big.map(p => `${pname(p)} → ${S.teams[p.tid].abbr}`).join(', ')}`);
    autosave(); rerender();
  } else {
    busy('Wrapping up free agency', 'Teams fill out rosters…');
    setTimeout(() => {
      endFA(S); newSeason(S); busy(null); autosave();
      toast(`Welcome to the ${U.seasonLabel(S.season)} preseason.`, 'good');
      go('home');
    }, 30);
  }
};

// ===== ui/cloud.js — optional cloud saves (private per viewer) when running as a published page =====
const Cloud = {
  state: 'unknown', db: null, uid: null, list: null, busy: false,
  async init() {
    if (this.state !== 'unknown') return this.state;
    if (!(window.claude && window.claude.use)) { this.state = 'off'; return this.state; }
    this.state = 'checking';
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      const uid = user ? await user.id() : null;
      if (!db || !uid) { this.state = 'off'; return this.state; }
      this.db = db; this.uid = uid; this.state = 'on';
    } catch (e) { this.state = 'off'; }
    return this.state;
  },
  base() { return 'data/users/' + this.uid; },
  async index() {
    const snap = await this.db.doc(this.base() + '/cloud_index').get();
    const d = snap.exists ? snap.data() : null;
    this.list = d && Array.isArray(d.saves) ? d.saves.map(x => Object.assign({}, x)) : [];
    return this.list;
  },
  async pack(text) {
    if (typeof CompressionStream === 'undefined') return { enc: 'raw', data: text };
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip'));
    const buf = new Uint8Array(await new Response(stream).arrayBuffer());
    let bin = ''; for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000));
    return { enc: 'gz64', data: btoa(bin) };
  },
  async unpack(enc, data) {
    if (enc === 'raw') return data;
    const bin = atob(data); const buf = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
    return await new Response(stream).text();
  },
  async upload(S, key) {
    const packed = await this.pack(JSON.stringify(S));
    const CH = 180000;
    const n = Math.ceil(packed.data.length / CH);
    for (let i = 0; i < n; i++) await this.db.doc(`${this.base()}/c_${key}_${i}`).set({ d: packed.data.slice(i * CH, (i + 1) * CH) });
    const list = await this.index();
    const old = list.find(x => x.key === key);
    const meta = Object.assign(saveMeta(S, key), { chunks: n, enc: packed.enc, kb: Math.round(packed.data.length / 1024) });
    const next = list.filter(x => x.key !== key); next.unshift(meta);
    await this.db.doc(this.base() + '/cloud_index').set({ saves: next.slice(0, 12) });
    if (old && old.chunks > n) for (let i = n; i < old.chunks; i++) await this.db.doc(`${this.base()}/c_${key}_${i}`).delete();
    this.list = next;
  },
  async download(meta) {
    let data = '';
    for (let i = 0; i < meta.chunks; i++) { const s = await this.db.doc(`${this.base()}/c_${meta.key}_${i}`).get(); if (!s.exists) throw new Error('A piece of this save is missing.'); data += s.data().d; }
    return JSON.parse(await this.unpack(meta.enc, data));
  },
  async remove(meta) {
    for (let i = 0; i < meta.chunks; i++) await this.db.doc(`${this.base()}/c_${meta.key}_${i}`).delete();
    const list = (await this.index()).filter(x => x.key !== meta.key);
    await this.db.doc(this.base() + '/cloud_index').set({ saves: list });
    this.list = list;
  },
};
function cloudPanel(bare) {
  const panel_ = (t, b) => bare ? b : panel(t, b);
  const st = Cloud.state;
  if (st === 'off') return panel_('Cloud Saves', '<p class="small mute" style="margin:0">Cloud saves work when you play from the published link while signed in. Use Export / Import to move a franchise between browsers.</p>');
  if (st !== 'on') return panel_('Cloud Saves', '<p class="small mute" style="margin:0">Checking for cloud storage…</p>');
  const rows = (Cloud.list || []).map(m => `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="small"><b>${E(m.team)}</b> · ${E(m.phaseLine)} · ${m.w}-${m.l}<div class="tiny mute">uploaded ${new Date(m.ts).toLocaleString()} · ${m.kb} KB</div></div><div class="row tight">${btn('Load', 'cloudLoad', 'sm gold', { k: m.key })}${btn('Delete', 'cloudDel', 'sm red', { k: m.key })}</div></div>`).join('');
  return panel_('Cloud Saves', `<p class="small mute" style="margin-top:0">Private to you. Upload this franchise, then load it from any device where you open this page.</p>${App.S ? `<div class="row">${btn('Upload This Franchise', 'cloudUp', 'gold')}</div>` : ''}<div style="margin-top:8px">${Cloud.list ? rows || '<div class="empty small">No cloud saves yet.</div>' : '<div class="small mute">Loading list…</div>'}</div>`);
}
async function cloudRefresh() {
  await Cloud.init();
  if (Cloud.state === 'on' && !Cloud.list) { try { await Cloud.index(); } catch (e) { Cloud.list = []; } }
  const el = $('#cloudSlot'); if (el) el.innerHTML = cloudPanel(el.dataset.bare === '1');
}
Act.cloudUp = async () => {
  if (Cloud.busy) return; Cloud.busy = true;
  busy('Uploading', 'Compressing your franchise…');
  try { await Cloud.upload(App.S, App.slot); toast('Uploaded to your cloud saves.', 'good'); }
  catch (e) { toast(e && e.code === 'quota_exceeded' ? 'Cloud storage is full. Delete an old cloud save first.' : 'Upload failed: ' + ((e && e.message) || 'unknown error'), 'bad'); }
  busy(null); Cloud.busy = false; cloudRefresh();
};
Act.cloudLoad = async el => {
  const m = (Cloud.list || []).find(x => x.key === el.dataset.k); if (!m) return;
  busy('Downloading', 'Unpacking your franchise…');
  try { const S = await Cloud.download(m); busy(null); startWith(S, m.key); await saveNow(true); toast('Franchise loaded from the cloud.', 'good'); }
  catch (e) { busy(null); toast('Download failed: ' + ((e && e.message) || 'unknown error'), 'bad'); }
};
Act.cloudDel = el => {
  const m = (Cloud.list || []).find(x => x.key === el.dataset.k); if (!m) return;
  confirmBox('Delete cloud save?', 'This removes the uploaded copy. Saves in this browser are not affected.', 'Delete', async () => {
    try { await Cloud.remove(m); toast('Cloud save deleted.'); } catch (e) { toast('Delete failed.', 'bad'); }
    cloudRefresh();
  }, 'red');
};

// ===== ui/screens_main.js — title, new franchise, home, inbox, news, save, help =====
const GAME_TITLE = 'Hardwood Franchise';

Screens.title = {
  bare: true,
  render() {
    return `<div class="title-wrap"><canvas class="bg" id="titleBg" aria-hidden="true"></canvas>
    <div class="title-card">
      <h1 class="wordmark">Hardwood<small>Franchise '05</small></h1>
      <p class="tagline">Owner. General manager. Head coach. Thirty teams, one ${LEAGUE.name}, and as many seasons as you can stand.</p>
      <div class="menu" id="titleMenu">
        ${btn('New Franchise', 'newFranchise', 'gold lg')}
        <div id="continueSlot"></div>
        ${btn('Load Franchise', 'loadMenu', '')}
        <label class="btn" style="position:relative;overflow:hidden"><span>Import Save File</span><input type="file" accept=".json,application/json" data-c="importFile" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label>
        ${btn('Cloud Saves', 'cloudMenu', 'ghost')}
        ${btn('How to Play', 'go', 'ghost', { r: 'help' })}
      </div>
      <p class="tiny dim" style="margin-top:22px">An original basketball franchise sim. All teams, players and people are fictional.</p>
    </div></div>`;
  },
  async after() {
    titleBg();
    const metas = await Store.metas();
    if (metas.length) {
      const m = metas[0];
      const el = $('#continueSlot');
      if (el) el.innerHTML = `<button class="btn team" data-a="loadSlot" data-k="${E(m.key)}" style="width:100%;--team:${m.c1};--teamtext:${textOn(m.c1)}"><span>Continue: ${E(m.abbr)} · ${U.seasonLabel(m.season)}</span></button>`;
    }
  },
};
function titleBg() {
  const c = $('#titleBg'); if (!c) return;
  const ctx = c.getContext('2d');
  const fit = () => { c.width = c.clientWidth * devicePixelRatio; c.height = c.clientHeight * devicePixelRatio; };
  fit();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t0 = performance.now();
  const draw = (now) => {
    if (!document.body.contains(c)) return;
    const w = c.width, h = c.height, t = (now - t0) / 1000;
    ctx.clearRect(0, 0, w, h);
    // hardwood planks in perspective
    const horizon = h * 0.42;
    for (let i = 0; i < 26; i++) {
      const x = (i / 25) * w;
      ctx.strokeStyle = `rgba(201,141,78,${0.10 + (i % 3) * 0.03})`; ctx.lineWidth = 1 * devicePixelRatio;
      ctx.beginPath(); ctx.moveTo(w / 2 + (x - w / 2) * 0.15, horizon); ctx.lineTo(x * 2.2 - w * 0.6, h); ctx.stroke();
    }
    for (let j = 0; j < 14; j++) { const y = horizon + Math.pow(j / 13, 2) * (h - horizon); ctx.strokeStyle = 'rgba(201,141,78,0.08)'; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    // center circle
    ctx.strokeStyle = 'rgba(255,182,39,0.25)'; ctx.lineWidth = 2 * devicePixelRatio;
    ctx.beginPath(); ctx.ellipse(w / 2, horizon + (h - horizon) * 0.55, w * 0.16, h * 0.08, 0, 0, Math.PI * 2); ctx.stroke();
    // sweeping arena spotlights
    for (let k = 0; k < 3; k++) {
      const a = Math.sin(t * 0.4 + k * 2.1) * 0.5;
      const sx = w * (0.2 + k * 0.3), g = ctx.createRadialGradient(sx + a * w * 0.3, horizon + h * 0.25, 0, sx + a * w * 0.3, horizon + h * 0.25, w * 0.25);
      g.addColorStop(0, 'rgba(255,214,121,0.12)'); g.addColorStop(1, 'rgba(255,214,121,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  window.addEventListener('resize', fit, { once: true });
}
Act.loadSlot = el => loadSlot(el.dataset.k);
Act.cloudMenu = () => { modal('Cloud Saves', '<div id="cloudSlot" data-bare="1">' + cloudPanel(true) + '</div>', '', { size: 'md' }); cloudRefresh(); };
Act.loadMenu = async () => {
  const metas = await Store.metas();
  const rows = metas.map(m => `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="row">${logo({ tid: m.tid, abbr: m.abbr, c1: m.c1, c2: m.c2, region: '', name: m.team }, 40)}<div><div class="b">${E(m.team)}</div><div class="small mute">${E(m.phaseLine)} · ${m.w}-${m.l}${m.titles ? ` · ${m.titles} title${m.titles > 1 ? 's' : ''}` : ''} · saved ${new Date(m.ts).toLocaleString()}</div></div></div><div class="row tight">${btn('Load', 'loadSlot', 'gold sm', { k: m.key })}${btn('Delete', 'delSlot', 'red sm', { k: m.key })}</div></div>`).join('');
  modal('Load Franchise', rows || '<div class="empty">No saved franchises yet.</div>', '', { size: 'md' });
};
Act.delSlot = el => {
  const k = el.dataset.k;
  confirmBox('Delete franchise?', 'This permanently deletes the save from this browser. Export it first if you might want it back.', 'Delete', async () => {
    await Store.del(k);
    await Store.put('__index', (await Store.metas()).filter(m => m.key !== k));
    toast('Save deleted.');
    if (App.route === 'title') render(); else rerender();
  }, 'red');
};
Act.importFile = (el) => {
  const f = el.files && el.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = async () => {
    try {
      const S = JSON.parse(rd.result);
      if (!S || !S.teams || !S.players || S.user == null) throw new Error('Not a Hardwood Franchise save file.');
      const key = 'f' + Date.now();
      startWith(S, key);
      await saveNow(true);
      toast('Save imported.', 'good');
    } catch (e) { toast('Import failed: ' + e.message, 'bad'); }
  };
  rd.readAsText(f);
};

// ---------- new franchise ----------
Screens.new = {
  bare: true,
  render() {
    const N = App.newSetup;
    const S = N.S;
    const sel = N.tid != null ? S.teams[N.tid] : null;
    const card = t => {
      const str = teamStrength(S, t.tid);
      return `<button class="tcard ${N.tid === t.tid ? 'on' : ''}" data-a="pickTeam" data-tid="${t.tid}" style="width:100%">${logo(t, 40)}<div class="grow"><div class="b">${E(t.region)} ${E(t.name)}</div><div class="tiny mute">Market ${t.pop.toFixed(1)}M · Team ${str.toFixed(0)}</div></div></button>`;
    };
    const conf = c => [0, 1, 2].map(d => { const dv = c * 3 + d; return `<div class="eyebrow" style="margin:10px 0 6px">${DIVS[dv]}</div><div class="grid g2" style="gap:6px">${S.teams.filter(t => t.div === dv).map(card).join('')}</div>`; }).join('');
    let detail = '<div class="empty">Pick a franchise to see its situation.</div>';
    if (sel) {
      const ps = U.sortBy(roster(S, sel.tid), p => p.ovr);
      const rank = S.teams.map(t => ({ tid: t.tid, v: teamStrength(S, t.tid) })).sort((a, b) => b.v - a.v).findIndex(x => x.tid === sel.tid) + 1;
      detail = `<div class="row">${logo(sel, 72)}<div><div class="eyebrow">${CONFS[sel.conf]} · ${DIVS[sel.div]}</div><div style="font:800 30px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(sel.region)} ${E(sel.name)}</div></div></div>
      <hr class="sep"><div class="kv">
        <span>Roster rank</span><span>${rank} of 30</span>
        <span>Market size</span><span>${sel.pop.toFixed(1)}M</span>
        <span>Payroll</span><span>${U.money(payroll(S, sel.tid))}</span>
        <span>Cash on hand</span><span>${U.money(sel.cash)}</span>
        <span>Arena</span><span>${E(sel.arena.name)} (${sel.arena.cap.toLocaleString()})</span>
        <span>Head coach</span><span>${E(staffName(sel.staff.hc))} (${staffOvr(sel.staff.hc)})</span>
      </div><hr class="sep"><div class="eyebrow" style="margin-bottom:6px">Key players</div>
      ${ps.slice(0, 5).map(p => `<div class="row between small" style="padding:3px 0"><span>${E(p.pos)} · ${E(pname(p))} <span class="mute">(${p.age})</span></span>${rt(p.ovr)}</div>`).join('')}`;
    }
    return `<div style="padding:24px max(16px, env(safe-area-inset-right,0px)) 40px max(16px, env(safe-area-inset-left,0px));max-width:1300px;margin:0 auto">
      ${pageHead('New Franchise', 'Choose the team you will own, run and coach.', btn('Back', 'go', 'ghost', { r: 'title' }))}
      <div class="grid g-main">
        <div class="grid g2">${panel('Eastern Conference', conf(0))}${panel('Western Conference', conf(1))}</div>
        <div class="stack">
          ${panel('Your Franchise', detail)}
          ${panel('League Settings', `<div class="stack">
            <label class="fld">Owner name<input type="text" id="ownerName" maxlength="28" value="${E(N.owner)}" data-i="setOwner"></label>
            <div class="fld">Difficulty ${seg('diff', DIFFS.map((d, i) => [i, d.n]), N.diff, 'setNew')}</div>
            <div class="fld">Season length ${seg('games', [[29, '29 games'], [58, '58 games'], [82, '82 games']], N.games, 'setNew')}</div>
            <label class="row small"><input type="checkbox" id="optInj" ${N.inj ? 'checked' : ''} data-c="setInj"> Injuries on</label>
            <label class="row small"><input type="checkbox" id="optFD" ${N.fd ? 'checked' : ''} data-c="setFD"> Fantasy draft — tear up every roster and draft a new league</label>
            <p class="tiny mute" style="margin:0">${DIFFS[N.diff].n}: ${['AI GMs are generous, free agents favor you, your team gets a small edge.', 'Balanced. The way the league was meant to be played.', 'Shrewd AI GMs and a tougher free-agent market.', 'Ruthless trades, skeptical free agents, and the bounces go against you.'][N.diff]}</p>
            ${btn('Start Franchise', 'startFranchise', 'gold lg')}
          </div>`)}
        </div>
      </div></div>`;
  },
};
Act.newFranchise = () => {
  busy('Building the league', 'Scouting 400 players…');
  setTimeout(() => {
    const S = newLeague({ userTid: 0 });
    App.newSetup = { S, tid: null, owner: 'You', diff: 1, games: 82, inj: true };
    busy(null);
    go('new');
  }, 30);
};
Act.pickTeam = el => { App.newSetup.tid = +el.dataset.tid; rerender(); };
Act.setOwner = el => { App.newSetup.owner = el.value; };
Act.setInj = el => { App.newSetup.inj = el.checked; };
Act.setFD = el => { App.newSetup.fd = el.checked; };
Act.setNew = el => { App.newSetup[el.dataset.t] = +el.dataset.k; rerender(); };
Act.startFranchise = async () => {
  const N = App.newSetup;
  if (N.tid == null) { toast('Pick a team first.', 'bad'); return; }
  const S = N.S;
  S.user = N.tid; S.ownerName = (N.owner || 'Owner').trim() || 'Owner'; S.diff = N.diff; S.settings.injuries = N.inj;
  if (S.settings.games !== N.games) { S.settings.games = N.games; S.nextGid = 1; genSchedule(S); }
  S.scout = { pts: scoutPoints(S), max: scoutPoints(S) };
  S.camp = { left: 4, log: [] };
  const t = S.teams[S.user];
  t.autoRot = true;
  inbox(S, { from: 'League Commissioner', subj: `Welcome to the ${LEAGUE.abbr}, ${S.ownerName}`, body: `Congratulations on your purchase of the ${tname(t)}. You'll make the calls on the floor, in the front office and in the owner's box. The fans of ${t.region} are watching.` });
  inbox(S, { from: `Coach ${staffName(t.staff.hc)}`, subj: 'Training camp is open', body: `We have ${S.camp.left} training camp sessions before the season. Run your young guys through drills (Team → Training Camp). When you're ready, hit Start Season.` });
  const ps = U.sortBy(roster(S, S.user), p => p.ovr);
  const exp = ps.filter(p => p.contract.exp === S.season && p.ovr >= 74)[0];
  if (exp) inbox(S, { from: `${pname(exp)}'s agent`, subj: 'Contract year', body: `${pname(exp)} is entering the final year of his deal. We're open to an extension (Roster → player card → Extend).` });
  if (N.fd) { startFantasyDraft(S); inbox(S, { from: 'League Commissioner', subj: 'Fantasy draft', body: 'Every player in the league is in the pool. Thirteen rounds, snake order. Build your team from scratch.' }); }
  radioShow(S);
  weeklyNews(S);
  App.newSetup = null;
  startWith(S, 'f' + Date.now());
  if (N.fd) go('fdraft');
  await saveNow(true);
  toast(`Welcome to ${t.region}, ${S.ownerName}!`, 'good');
};

// ---------- home ----------
Screens.home = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const r = t.rec;
    const conf = standings(S, x => x.conf === t.conf);
    const crank = conf.indexOf(t) + 1;
    let main = '';
    if (S.phase === PH.REG || S.phase === PH.PO) main = nextGameCard(S);
    else main = phaseCard(S);
    let news = S.news.filter(n => n.imp >= 2 || (n.tids || []).includes(S.user)).slice(0, 6);
    if (news.length < 3) news = S.news.slice(0, 6);
    const msgs = S.inbox.slice(0, 4);
    const leaders = teamLeaders(S, S.user);
    const div = standings(S, x => x.div === t.div);
    const gp = r.w + r.l;
    const fin = t.fin;
    const snap = `<div class="row" style="gap:18px">
      <div><div class="eyebrow">Record</div><div class="big">${rec(t)}</div></div>
      <div><div class="eyebrow">${CONFS[t.conf]}</div><div class="big">${U.ord(crank)}</div></div>
      <div><div class="eyebrow">Streak</div><div class="big">${streakStr(t)}</div></div>
      <div><div class="eyebrow">Last 10</div><div class="big">${r.l10.filter(x => x).length}-${r.l10.filter(x => !x).length}</div></div>
    </div><hr class="sep">
    <div class="stack small">
      ${meter('Fan happiness', t.fan)}${meter('Hype', t.hype)}${meter('Team chemistry', teamChem(S, S.user))}
    </div><hr class="sep"><div class="kv small">
      <span>Point differential</span><span class="${r.pf - r.pa >= 0 ? 'good' : 'bad'}">${gp ? ((r.pf - r.pa) / gp >= 0 ? '+' : '') + ((r.pf - r.pa) / gp).toFixed(1) : '—'}</span>
      <span>Avg. attendance</span><span>${fin && fin.hg ? Math.round(fin.att / fin.hg).toLocaleString() + ' / ' + t.arena.cap.toLocaleString() : '—'}</span>
      <span>Profit this season</span><span>${fin ? U.money(ledgerTotal(fin.rev) - ledgerTotal(fin.exp)) : '—'}</span>
    </div>`;
    return `${pageHead('Franchise Central', `${E(S.ownerName)}, owner · ${phaseLine(S)}`)}
    <div class="grid g-main">
      <div class="stack">${main}
        ${panel('Headlines', news.length ? news.map(newsItem).join('') : '<div class="empty">Quiet around the league.</div>', { x: btn('Newsroom', 'go', 'sm ghost', { r: 'news' }) })}
      </div>
      <div class="stack">
        ${lastGameCard(S)}
        ${panel(`${E(t.name)} Snapshot`, snap)}
        ${panel('Inbox', msgs.length ? msgs.map(m => `<div class="inbox-item ${m.read ? '' : 'unread'}" style="padding:8px 4px"><div class="from">${E(m.from)}</div><div class="b small">${E(m.subj)}</div></div>`).join('') : '<div class="empty">No messages.</div>', { x: btn('Open', 'go', 'sm ghost', { r: 'inbox' }), flush: false })}
        ${panel('Team Leaders', leaders)}
        ${panel(`${DIVS[t.div]} Division`, sortTable('homeDiv', [
      { l: 'Team', f: x => `<span class="row tight">${logo(x, 20)} ${tlink(x)}</span>` }, { l: 'W', n: 1, f: x => x.rec.w }, { l: 'L', n: 1, f: x => x.rec.l },
      { l: 'GB', n: 1, f: x => { const g = gamesBack(div[0], x); return g ? g.toFixed(1) : '—'; } }, { l: 'Strk', f: x => streakStr(x) }], div, { rowCls: x => x.tid === S.user ? 'me' : '' }), { flush: true })}
      </div>
    </div>`;
  },
};
function lastGameCard(S) {
  const u = S.user;
  const games = S.sched.filter(g => g.hs != null && (g.h === u || g.a === u)).concat(S.playoffs ? S.playoffs.games.filter(g => g.h === u || g.a === u) : []);
  const g = games[games.length - 1];
  if (!g) return '';
  const home = g.h === u, opp = S.teams[home ? g.a : g.h];
  const us = home ? g.hs : g.as, them = home ? g.as : g.hs;
  const won = us > them;
  const b = S.box[g.gid];
  let top = '';
  if (b) { const T = b.teams.find(x => x.tid === u); const pl = T ? U.maxBy(T.ps, l => l.pts + (l.orb + l.drb) * 0.7 + l.ast * 0.8) : null; if (pl) top = `<div class="small mute" style="margin-top:6px">${E(pl.n)}: ${pl.pts} pts, ${pl.orb + pl.drb} reb, ${pl.ast} ast</div>`; }
  return panel('Last Game', `<div class="row between"><div class="row">${logo(opp, 36)}<div><div class="b">${home ? 'vs' : '@'} ${E(tname(opp))}</div><div class="small"><span class="b ${won ? 'good' : 'bad'}">${won ? 'W' : 'L'}</span> <span class="num">${us}-${them}${g.ot ? ' OT' : ''}</span></div></div></div>${b ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : ''}</div>${top}`);
}
function meter(label, v) { return `<div><div class="row between"><span class="mute">${label}</span><span class="num">${Math.round(v)}</span></div><div class="bar e"><i style="width:${U.clamp(v, 0, 100)}%"></i></div></div>`; }
function newsItem(n) {
  const S = App.S;
  const tl = (n.tids || []).slice(0, 2).map(tid => S.teams[tid] ? logo(S.teams[tid], 22) : '').join('');
  return `<div class="news-item"><div class="row tight" style="margin-bottom:2px">${tl}<span class="tiny mute">${dateLabel(S, n.d, n.ph)} · ${U.seasonLabel(n.s)}${n.by ? ' · ' + E(n.by) : ''}</span></div><h4>${E(n.h)}</h4><p>${E(n.b)}</p></div>`;
}
function teamLeaders(S, tid) {
  const ps = roster(S, tid).map(p => ({ p, pg: perGame(seasonTotals(p, S.season)) })).filter(x => x.pg.gp > 0);
  if (!ps.length) { const top = U.sortBy(roster(S, tid), p => p.ovr).slice(0, 4); return top.map(p => `<div class="row between small" style="padding:4px 0"><span>${plink(p)} <span class="mute">${p.pos}</span></span>${rt(p.ovr)}</div>`).join(''); }
  const cats = [['Points', 'ppg'], ['Rebounds', 'rpg'], ['Assists', 'apg'], ['Steals', 'spg'], ['Blocks', 'bpg']];
  return cats.map(([l, k]) => { const x = U.maxBy(ps, y => y.pg[k]); return `<div class="row between small" style="padding:4px 0"><span class="mute" style="width:72px">${l}</span><span class="grow">${plink(x.p)}</span><span class="num b">${x.pg[k].toFixed(1)}</span></div>`; }).join('');
}
function nextGameCard(S) {
  const g = userGameToday(S) || (S.phase === PH.REG ? nextGame(S, S.user) : null);
  const t = S.teams[S.user];
  const elim = S.phase === PH.PO && !S.playoffs.rounds[S.playoffs.round].some(x => (x.hi === S.user || x.lo === S.user) && x.winner == null);
  let body;
  if (S.allStar && !S.allStar.finished) body = `<div class="c" style="padding:12px"><div class="eyebrow">Midseason</div><div style="font:800 30px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg);margin:6px 0 12px">All-Star Weekend</div>${btn('Go to All-Star Weekend', 'goAllStar', 'gold lg')}</div>`;
  else if (g) {
    const H = S.teams[g.h], A = S.teams[g.a];
    const today = g.day === S.day || g.po;
    const sr = g.po ? seriesOf(S, g.h, g.a) : null;
    const side = (T, home) => `<div class="c" style="flex:1;min-width:0">${logo(T, 84)}<div style="font:800 22px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg);margin-top:6px">${E(T.region)}</div><div class="mute small">${E(T.name)} · ${rec(T)}</div><div class="tiny dim">${home ? 'HOME' : 'AWAY'}</div></div>`;
    body = `<div class="row" style="align-items:center;gap:6px">${side(A, false)}<div class="c" style="flex:none"><div style="font:800 28px/1 var(--f-disp);color:var(--gold);transform:skewX(-8deg)">@</div><div class="tiny mute" style="margin-top:6px">${g.po ? `${ROUND_NAMES[g.round]}<br>Game ${g.n} · ${S.teams[sr.hi].abbr} ${sr.w[0]}-${sr.w[1]}` : today ? 'Today' : 'Day ' + g.day}</div></div>${side(H, true)}</div>
    <hr class="sep"><div class="row" style="justify-content:center">${today ? `${btn('Play Game', 'gameDay', 'gold lg')}${btn('Quick Sim Day', 'simDay1', 'lg')}` : btn('Sim to Game Day', 'simTo', 'gold lg', { k: 'next' })}</div>`;
  } else if (elim) body = `<div class="c" style="padding:14px"><div class="eyebrow">Playoffs</div><p>Your season is over. The playoffs go on without you.</p></div>`;
  else body = '<div class="empty">No games scheduled.</div>';
  const sims = S.phase === PH.REG
    ? `${btn('Sim Day', 'simDay1', 'sm')}${btn('Sim Week', 'simN', 'sm', { n: 7 })}${btn('To Next Game', 'simTo', 'sm', { k: 'next' })}${S.day < S.allStarDay ? btn('To All-Star', 'simTo', 'sm', { k: 'allstar' }) : ''}${S.day <= S.deadlineDay ? btn('To Deadline', 'simTo', 'sm', { k: 'deadline' }) : ''}${btn('To Playoffs', 'simTo', 'sm', { k: 'end' })}`
    : `${btn('Sim Day', 'simDay1', 'sm')}${btn('Sim Round', 'simTo', 'sm', { k: 'round' })}${btn('Sim Playoffs', 'simTo', 'sm', { k: 'po' })}`;
  return panel(S.phase === PH.PO ? 'Playoffs' : 'Next Game', body + `<hr class="sep"><div class="row tight" style="justify-content:center">${sims}</div>`);
}
function phaseCard(S) {
  const t = S.teams[S.user];
  const big = (eyebrow, title, text, act) => `<div class="c" style="padding:14px 8px"><div class="eyebrow">${eyebrow}</div><div style="font:800 32px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg);margin:8px 0">${title}</div><p class="mute" style="max-width:52ch;margin:0 auto 14px">${text}</p>${act}</div>`;
  if (S.phase === PH.PRE && S.fdraft && !S.fdraft.done) return panel('Fantasy Draft', big('A brand-new league', 'Fantasy Draft', `Round ${S.fdraft.picks[S.fdraft.cur].rd} of 13. Every player in the league is up for grabs.`, btn('Enter the Draft', 'go', 'gold lg', { r: 'fdraft' })));
  if (S.phase === PH.PRE) {
    const iss = userRosterIssues(S);
    return panel('Preseason', big(U.seasonLabel(S.season), 'Training Camp', `${S.camp && S.camp.left ? `${S.camp.left} camp session${S.camp.left > 1 ? 's' : ''} left. Drill your players to boost their ratings. ` : 'Camp is done. '}Set your rotation and ticket prices before opening night.${iss.length ? `<br><span class="bad">${iss.join(' ')}</span>` : ''}`, `<div class="row" style="justify-content:center">${S.camp && S.camp.left ? btn('Training Camp', 'go', 'lg', { r: 'camp' }) : ''}${btn('Start Season', 'advStart', 'gold lg')}</div>`));
  }
  if (S.phase === PH.END) { const h = S.history[S.history.length - 1]; return panel('Season Complete', big(U.seasonLabel(S.season), `${E(h.champName)} win it all`, `Your ${t.name}: ${t.rec.w}-${t.rec.l}, ${PO_RESULT[h.user.po].toLowerCase()}.`, `<div class="row" style="justify-content:center">${btn('Season Review', 'go', 'lg', { r: 'review' })}${btn('Begin Offseason', 'advOffseason', 'gold lg')}</div>`)); }
  if (S.phase === PH.LOTTERY) return panel('Offseason', big('Offseason', 'Draft Lottery', 'Fourteen teams, one top pick. The ping-pong balls decide the order.', `<div class="row" style="justify-content:center">${btn('Progression Report', 'go', 'lg', { r: 'progress' })}${btn('Run Lottery', 'goLottery', 'gold lg')}</div>`));
  if (S.phase === PH.DRAFT) { const mine = S.draft.picks.filter(p => p.tid === S.user && !p.pid).map(p => '#' + p.pick).join(', '); return panel('Offseason', big(`${S.draft.year} Draft`, S.draft.done ? 'Draft Complete' : 'Draft Day', S.draft.done ? 'Your rookies are signed. Time to deal with expiring contracts.' : `Your picks: ${mine || 'none remaining'}.`, S.draft.done ? btn('Re-sign Players', 'advResign', 'gold lg') : btn('Enter Draft Room', 'goDraft', 'gold lg'))); }
  if (S.phase === PH.RESIGN) { const n = roster(S, S.user).filter(p => p.contract.exp <= S.season).length; return panel('Offseason', big('Contracts', 'Re-sign Players', `${n} of your players ${n === 1 ? 'has' : 'have'} expiring deals. Anyone you don't sign hits the open market.`, `<div class="row" style="justify-content:center">${btn('Negotiate', 'go', 'lg', { r: 'resign' })}${btn('Open Free Agency', 'advFA', 'gold lg')}</div>`)); }
  if (S.phase === PH.FA) { const mine = S.players.filter(p => p.tid === -1 && p.fa && p.fa.offers.some(o => o.tid === S.user)).length; return panel('Offseason', big(`Day ${Math.min(S.fa.day, S.fa.days)} of ${S.fa.days}`, 'Free Agency', `You have ${mine} pending offer${mine === 1 ? '' : 's'}. Cap room: ${U.money(capSpace(S, S.user))}. Players decide over the coming days — the best ones go fast.`, `<div class="row" style="justify-content:center">${btn('Free Agent Market', 'go', 'lg', { r: 'fa' })}${btn(advanceInfo(S).label, 'faNext', 'gold lg')}</div>`)); }
  return '';
}

// ---------- inbox ----------
Screens.inbox = {
  render() {
    const S = App.S;
    const items = S.inbox.map(m => {
      const a = m.act || {};
      let acts = '';
      if (!m.done && a.kind) {
        if (a.kind === 'pt') acts = `${btn('Promise minutes', 'inboxAct', 'gold sm', { id: m.id, c: 'promise' })}${btn('Earn it', 'inboxAct', 'sm', { id: m.id, c: 'earn' })}${btn('Trading block', 'inboxAct', 'sm ghost', { id: m.id, c: 'block' })}`;
        if (a.kind === 'tradereq') acts = `${btn('Sit down with him', 'inboxAct', 'gold sm', { id: m.id, c: 'talk' })}${btn('Put on trading block', 'inboxAct', 'sm', { id: m.id, c: 'block' })}`;
        if (a.kind === 'naming') acts = `${btn('Accept deal', 'inboxAct', 'gold sm', { id: m.id, c: 'accept' })}${btn('Decline', 'inboxAct', 'sm', { id: m.id, c: 'decline' })}`;
        if (a.kind === 'sponsor') acts = `${btn('Accept', 'inboxAct', 'gold sm', { id: m.id, c: 'accept' })}${btn('Decline', 'inboxAct', 'sm', { id: m.id, c: 'decline' })}`;
        if (a.kind === 'ext') acts = `${btn('Open negotiations', 'negotiateOpen', 'gold sm', { id: a.pid })}${btn('Not now', 'inboxAct', 'sm', { id: m.id, c: 'later' })}`;
        if (a.kind === 'offer') acts = `${btn('Accept trade', 'inboxAct', 'gold sm', { id: m.id, c: 'accept' })}${btn('Decline', 'inboxAct', 'sm', { id: m.id, c: 'decline' })}${a.oid ? btn('Counter in Trade Center', 'counterOffer', 'sm ghost', { id: a.oid }) : ''}`;
      }
      return `<div class="inbox-item ${m.read ? '' : 'unread'}"><div class="row between"><span class="from">${E(m.from)}</span><span class="tiny dim">${dateLabel(S, m.d)} · ${U.seasonLabel(m.s)}</span></div><h4>${E(m.subj)}</h4><div class="small">${E(m.body)}</div>${acts ? `<div class="row tight" style="margin-top:8px">${acts}</div>` : ''}${m.reply ? `<div class="small gold" style="margin-top:6px">↳ ${E(m.reply)}</div>` : ''}</div>`;
    }).join('');
    return `${pageHead('Inbox', `${unread(S)} unread`, btn('Mark all read', 'readAll', 'sm'))}${panel('Messages', items || '<div class="empty">No messages.</div>', { flush: true })}`;
  },
  after() { const S = App.S; setTimeout(() => { S.inbox.forEach(m => { if (!m.act || m.done) m.read = true; }); }, 50); },
};
Act.readAll = () => { App.S.inbox.forEach(m => m.read = true); rerender(); };
Act.inboxAct = el => { const msg = resolveInbox(App.S, +el.dataset.id, el.dataset.c); if (msg) toast(msg); autosave(); rerender(); };
Act.counterOffer = el => { const o = App.S.offers.find(x => x.id === +el.dataset.id); if (!o) { toast('Offer expired.'); return; } App.trade = { tid: o.tid, give: { pids: o.pids.slice(), picks: [] }, get: { pids: o.get.pids.slice(), picks: o.get.picks.slice() } }; go('trade'); };

// ---------- newsroom ----------
Screens.news = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const tb = tabs('news', [['herald', 'The Hardwood Herald'], ['local', localPaper(t)], ['radio', RADIO.show], ['trans', 'Transactions']], 'herald');
    let body = '';
    if (tb.cur === 'herald') {
      const items = S.news.filter(n => n.type !== 'column' && n.type !== 'recap');
      const lead = items.slice().sort((a, b) => (b.imp - a.imp) || (b.id - a.id)).slice(0, 1)[0];
      body = `<div class="paper"><div class="mast"><h2>The Hardwood Herald</h2><div class="dt">${LEAGUE.name} · ${phaseLine(S)}</div></div>
        ${lead ? `<div class="lead"><div class="by">${dateLabel(S, lead.d, lead.ph)}</div><h3>${E(lead.h)}</h3><p>${E(lead.b)}</p></div><hr style="border:0;border-top:1px solid #1b1b1b">` : ''}
        <div class="cols">${items.filter(n => n !== lead).slice(0, 40).map(n => `<div class="art"><h4>${E(n.h)}</h4><p>${E(n.b)}</p><div class="by">${dateLabel(S, n.d, n.ph)}, ${U.seasonLabel(n.s)}</div></div>`).join('')}</div></div>`;
    } else if (tb.cur === 'local') {
      const items = S.news.filter(n => (n.tids || []).includes(S.user) || n.local);
      body = `<div class="paper"><div class="mast"><h2>${E(localPaper(t))}</h2><div class="dt">Sports · ${E(t.name)} coverage by ${E(beatWriter(t))}</div></div>
        <div class="cols">${items.slice(0, 50).map(n => `<div class="art"><h4>${E(n.h)}</h4><p>${E(n.b)}</p><div class="by">${n.by ? 'By ' + E(n.by) + ' · ' : ''}${dateLabel(S, n.d, n.ph)}, ${U.seasonLabel(n.s)}</div></div>`).join('') || '<p>No stories yet.</p>'}</div></div>`;
    } else if (tb.cur === 'radio') {
      const eps = S.radio;
      body = `<div class="row" style="margin-bottom:12px"><div><div class="eyebrow">${RADIO.station}</div><div style="font:800 26px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${RADIO.show}</div><div class="small mute">with ${RADIO.host} and ${RADIO.cohost} · new episode every week</div></div></div>` +
        (eps.length ? eps.slice(0, 8).map((ep, i) => panel(`${E(ep.title)} <span class="mute small" style="font-family:var(--f-body);text-transform:none;letter-spacing:0">· ${dateLabel(S, ep.d, ep.ph)}, ${U.seasonLabel(ep.s)}</span>`, ep.lines.map(l => `<div class="radio-line ${l.who === RADIO.host.split(' ')[0] || l.who === RADIO.cohost.split(' ')[0] ? 'host' : ''}"><div class="who">${E(l.who)}</div><div>${E(l.text)}</div></div>`).join(''), { style: 'margin-bottom:12px' })).join('') : '<div class="empty">No episodes yet.</div>');
    } else {
      body = panel('Transaction Wire', sortTable('trans', [{ l: 'When', f: x => `<span class="tiny">${dateLabel(S, x.d, x.ph)} ${U.seasonLabel(x.s)}</span>` }, { l: 'Type', f: x => `<span class="chip">${E(x.type)}</span>` }, { l: 'Details', f: x => `<span style="white-space:normal">${E(x.text)}</span>` }], S.trans.slice(0, 200)), { flush: true });
    }
    return `${pageHead('Newsroom', 'Papers, talk radio and the transaction wire')}${tb.html}${body}`;
  },
};

// ---------- save ----------
Screens.save = {
  render() {
    const S = App.S;
    return `${pageHead('Save / Load', `Saves live in this browser${Store.mode === 'ls' ? ' (local storage)' : ''}. Export a file to back up or move a franchise.`)}
    <div class="grid g2">
      ${panel('This Franchise', `<p class="small mute">The game autosaves after every sim and transaction.</p><div class="row">${btn('Save Now', 'saveBtn', 'gold')}${btn('Export Save File', 'exportSave', '')}${btn('Quit to Title', 'quitTitle', 'ghost')}</div>`)}
      ${panel('Other Franchises', `<div class="row">${btn('Load Franchise', 'loadMenu', '')}<label class="btn" style="position:relative;overflow:hidden"><span>Import Save File</span><input type="file" accept=".json,application/json" data-c="importFile" style="position:absolute;inset:0;opacity:0;cursor:pointer"></label></div>`)}
    </div>
    <div id="cloudSlot" style="margin-top:14px">${cloudPanel()}</div>`;
  },
  after() { cloudRefresh(); },
};
Act.saveBtn = () => saveNow(false);
Act.quitTitle = async () => { await saveNow(true); resetTransient(); App.S = null; App.slot = null; document.documentElement.removeAttribute('style'); go('title'); };
Act.exportSave = async () => {
  const S = App.S;
  const text = JSON.stringify(S);
  const t = S.teams[S.user];
  const filename = `hardwood-${t.abbr.toLowerCase()}-${S.season}.json`;
  const fallback = () => modal('Export Save', `<p class="small">Copy everything below into a text file named <b>${filename}</b>. Import it from the title screen.</p><textarea style="width:100%;height:240px;background:var(--panel2);color:var(--text);border:1px solid var(--line2)" readonly>${E(text)}</textarea>`, btn('Copy', 'copyExport', 'gold'), { size: 'md' });
  if (window.claude && window.claude.use) {
    let dl = null;
    try { dl = await window.claude.use('downloads'); } catch (e) { dl = null; }
    if (!dl) { fallback(); return; }
    try { await dl.save({ filename, data: new Blob([text], { type: 'application/json' }) }); toast('Save file exported.', 'good'); }
    catch (e) { if (e && e.code === 'declined') toast('Export cancelled.'); else fallback(); }
    return;
  }
  try {
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Save file downloaded.', 'good');
  } catch (e) { fallback(); }
};
Act.copyExport = () => { const ta = $('#modal textarea'); if (!ta) return; try { navigator.clipboard.writeText(ta.value).then(() => toast('Copied.', 'good'), () => { ta.select(); toast('Press Ctrl/Cmd+C to copy.'); }); } catch (e) { ta.select(); } };

// ---------- help ----------
Screens.help = {
  bare: false,
  render() {
    const body = `
    <div class="grid g2">
    ${panel('The Job', `<p>You are the owner, general manager and head coach of a ${LEAGUE.name} franchise. Win games, keep the fans happy and keep the books in the black — season after season.</p>
      <p><b>The gold button</b> in the top bar always moves the franchise forward: start the season, play or sim today's game, run the lottery, open free agency.</p>`)}
    ${panel('Game Day', `<p>On game days choose <b>Play Game</b> to coach it live. Call an offensive set and defensive scheme, set the pace, burn timeouts and make substitutions. Calls apply from the next possession.</p>
      <p>Matchups matter: a zone dares bad shooters to beat you; the press feasts on shaky ball-handlers but tires your legs; feeding a hot hand works until the defense adjusts. Your assistant's <b>scouting report</b> on the pregame screen suggests calls. The opposing coach adjusts at quarter breaks and timeouts.</p>
      <p>Keys: <b>Space</b> pauses and resumes. Tap a player in your lineup, then a bench player, to sub.</p>`)}
    ${panel('Front Office', `<p><b>Trades</b>: build a package in the Trade Center. AI GMs value youth, upside and fair contracts, and contenders and rebuilders want different things. Over the cap, incoming salary must be within 125% of outgoing.</p>
      <p><b>Free agency</b> runs for ten days after re-signing. Players weigh money, years, winning, market, facilities and their role. Over the cap you get one mid-level exception per season plus minimum deals.</p>
      <p><b>Draft</b>: spend scouting points all season to see prospects clearly. Unscouted ratings are guesses.</p>`)}
    ${panel("Owner's Box", `<p>Set ticket, concession, merchandise and parking prices. High prices earn more per fan but empty seats and anger the radio callers. Upgrades boost revenue, development, health and home-court edge. Build a new arena — or move the team to a new city.</p>`)}
    ${panel('Training Camp', `<p>Before each season you get four camp sessions. Three drills are playable mini-games (Shooting: stop the meter in the green; Ball-Handling: repeat the combo; Defense: stay in front of the ball). Young players gain the most.</p>`)}
    ${panel('Players &amp; Morale', `<p>Players want minutes that fit their role, money that fits their value, and to win. Unhappy players play worse, gripe in your inbox and walk in free agency. Promises you make in the inbox are tracked.</p><p>You can move a player to a new position from his card; his overall is recalculated for that spot.</p>`)}
    ${panel('Extras', `<p><b>Fantasy draft</b>: tick it when starting a franchise to throw every player into one pool and draft a new league.</p><p><b>Retire numbers</b>: once a franchise great retires (four seasons with you, or a Hall of Famer), raise his banner from his player card.</p><p><b>All-Star Weekend</b>: if one of your players is in the Three-Point Shootout, you can shoot for him.</p>`)}
    </div>`;
    return App.S ? `${pageHead('How to Play')}${body}` : `<div style="padding:24px max(16px, env(safe-area-inset-right,0px)) 40px max(16px, env(safe-area-inset-left,0px));max-width:1100px;margin:0 auto">${pageHead('How to Play', '', btn('Back', 'go', 'ghost', { r: 'title' }))}${body}</div>`;
  },
};
Object.defineProperty(Screens.help, 'bare', { get() { return !App.S; } });

// ===== ui/screens_team.js — roster, player card, rotation, schedule, box scores, camp =====
function rosterCols(S, mode, own) {
  const name = { l: 'Player', k: 'name', s: p => p.ln, f: p => `<span class="row tight">${plink(p)}${injChip(p)}${S.tradeBlock.includes(p.pid) ? '<span class="chip warn" title="On trading block">TB</span>' : ''}</span>` };
  const base = [{ l: '#', k: 'num', n: 1, f: p => p.num }, name, { l: 'Pos', k: 'pos', s: p => POS_IDX[p.pos], f: p => p.pos }, { l: 'Age', k: 'age', n: 1, f: p => p.age }, { l: 'OVR', k: 'ovr', c: 1, f: p => rt(p.ovr) }, { l: 'POT', k: 'pot', c: 1, s: p => Math.max(p.pot, p.ovr), f: p => potStr(S, p) }];
  if (mode === 'stats') {
    const pg = p => p._pg || (p._pg = perGame(seasonTotals(p, S.season, S.phase === PH.PO ? 1 : 0)));
    return base.slice(0, 5).concat([['GP', 'gp', 0], ['MPG', 'mpg', 1], ['PTS', 'ppg', 1], ['REB', 'rpg', 1], ['AST', 'apg', 1], ['STL', 'spg', 1], ['BLK', 'bpg', 1], ['TOV', 'tpg', 1]].map(([l, k, d]) => ({ l, k, n: 1, s: p => pg(p)[k], f: p => d ? pg(p)[k].toFixed(1) : pg(p)[k] })).concat([
      { l: 'FG%', k: 'fgp', n: 1, s: p => pg(p).fgp, f: p => U.fg(pg(p).fgp * 1000, 1000) }, { l: '3P%', k: 'tpp', n: 1, s: p => pg(p).tpp, f: p => U.fg(pg(p).tpp * 1000, 1000) }, { l: 'FT%', k: 'ftp', n: 1, s: p => pg(p).ftp, f: p => U.fg(pg(p).ftp * 1000, 1000) }]));
  }
  if (mode === 'contract') return base.concat([
    { l: 'Salary', k: 'sal', n: 1, s: p => p.contract.amt, f: p => U.money(p.contract.amt) }, { l: 'Thru', k: 'exp', n: 1, s: p => p.contract.exp, f: p => U.seasonLabel(p.contract.exp) },
    { l: 'Value', k: 'val', n: 1, s: p => marketSalary(S, p), f: p => U.money(marketSalary(S, p)) }, { l: 'Morale', k: 'morale', s: p => p.morale, f: p => moodIcon(p.morale) },
    { l: 'Type', k: 'pers', s: p => p.pers, f: p => `<span class="small">${PERSONALITIES[p.pers].n}</span>` }, { l: 'Role', k: 'role', s: p => p.ovr, f: p => `<span class="small mute">${roleName(teamRanks(S, p.tid)[p.pid])}</span>` }]);
  return base.concat([{ l: 'Ht', k: 'hgt', n: 1, f: p => U.hgt(p.hgt) }].concat(['ins', 'mid', 'tpt', 'pas', 'bhd', 'drb', 'pdf', 'idf', 'spd'].map(k => ({ l: RSHORT[k], k, n: 1, tip: RLONG[k], s: p => p.r[k], f: p => p.r[k] }))))
    .concat([{ l: 'Salary', k: 'sal', n: 1, s: p => p.contract.amt, f: p => contractStr(S, p) }, { l: 'Mood', k: 'morale', c: 1, s: p => p.morale, f: p => `<span title="${moodWord(p.morale)}" class="${p.morale >= 65 ? 'good' : p.morale >= 40 ? 'warn' : 'bad'}">●</span>` }]);
}
function rosterTable(S, tid, id) {
  const ps = roster(S, tid);
  ps.forEach(p => delete p._pg);
  const tb = tabs(id + 'm', [['ratings', 'Ratings'], ['stats', 'Stats'], ['contract', 'Contracts']], 'ratings');
  return tb.html + sortTable(id + tb.cur, rosterCols(S, tb.cur, tid === S.user), ps, { sort: { k: 'ovr', d: true } });
}
Screens.roster = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const n = roster(S, S.user).length;
    const pay = payroll(S, S.user);
    const dead = U.sum(t.dead.filter(d => d.exp >= S.season), d => d.amt);
    return `${pageHead('Roster', `${n} players · Payroll ${U.money(pay)}${dead ? ` (incl. ${U.money(dead)} dead money)` : ''} · Cap ${U.money(S.cap)} · Tax line ${U.money(S.tax)}`, `${btn('Rotation', 'go', '', { r: 'rotation' })}${btn('Sign Free Agents', 'go', 'gold', { r: 'fa' })}`)}
      ${userRosterIssues(S).map(x => `<div class="chip bad" style="margin-bottom:10px">${x}</div>`).join('')}
      ${panel(`${E(tname(t))}`, rosterTable(S, S.user, 'ros'), { flush: true })}
      <p class="tiny mute">Click a player for his full card: ratings, career stats, contract actions and the trading block.</p>`;
  },
};
Screens.team = {
  render(prm) {
    const S = App.S, t = S.teams[prm.tid != null ? prm.tid : S.user];
    if (t.tid === S.user) return Screens.roster.render();
    const st = t.staff;
    return `${pageHead(`<span style="display:inline-flex;vertical-align:middle;margin-right:8px">${logo(t, 44)}</span>${E(tname(t))}`, `${rec(t)} · ${CONFS[t.conf]} ${DIVS[t.div]} · ${teamMode(S, t.tid) === 'contend' ? 'Contending' : teamMode(S, t.tid) === 'rebuild' ? 'Rebuilding' : 'Middle of the pack'} · Payroll ${U.money(payroll(S, t.tid))}`, btn('Propose Trade', 'tradeWith', 'gold', { tid: t.tid }))}
      <div class="grid g-main"><div>${panel('Roster', rosterTable(S, t.tid, 'tm'), { flush: true })}</div>
      <div class="stack">${panel('Front Office', `<div class="kv small"><span>Head coach</span><span>${E(staffName(st.hc))} (${staffOvr(st.hc)})</span><span>Arena</span><span>${E(t.arena.name)}</span><span>Capacity</span><span>${t.arena.cap.toLocaleString()}</span><span>Market</span><span>${t.pop.toFixed(1)}M</span><span>Hype</span><span>${Math.round(t.hype)}</span><span>Defense</span><span>${DEF_SCHEMES[t.strat.def].n}</span><span>Pace</span><span>${PACES[t.strat.pace]}</span></div>`)}
      ${panel('Team History', t.hist.length ? sortTable('th' + t.tid, [{ l: 'Season', f: h => U.seasonLabel(h.s) }, { l: 'W-L', f: h => `${h.w}-${h.l}` }, { l: 'Result', f: h => `<span class="${h.po === 5 ? 'gold b' : ''}">${PO_RESULT[h.po]}</span>` }], t.hist.slice().reverse()) : '<div class="empty">First season.</div>', { flush: true })}
      ${panel('Draft Picks', S.picks.filter(k => k.tid === t.tid).sort((a, b) => a.year - b.year || a.rd - b.rd).map(k => `<span class="chip" style="margin:2px">${E(pickLabel(S, k))}</span>`).join('') || '<span class="mute small">None</span>')}
      </div></div>`;
  },
};
Act.tradeWith = el => { App.trade = { tid: +el.dataset.tid, give: { pids: [], picks: [] }, get: { pids: [], picks: [] } }; go('trade'); };

// ---------- player card ----------
Act.player = el => openPlayer(+el.dataset.id);
function openPlayer(pid) {
  const S = App.S, p = P(S, pid);
  if (!p) return;
  const t = p.tid >= 0 ? S.teams[p.tid] : null;
  const retireBtn = canRetireNum(S, p) ? btn(`Retire #${p.num} in ${E(S.teams[S.user].region)}`, 'retireNum', 'gold', { id: p.pid }) : '';
  if (!p.r) { modal(E(pname(p)), `<p class="mute">Retired ${p.retired}. Career: ${careerTotals(p).pts.toLocaleString()} points in ${careerTotals(p).gp} games.</p>${careerTable(S, p)}`, retireBtn, { size: 'md' }); return; }
  const ranks = t ? teamRanks(S, t.tid) : {};
  const pr = perceived(S, p);
  const scoutedHide = p.tid === -2 && (p.slvl || 0) < 2;
  const bars = RGROUPS.map(([g, ks]) => `<div><div class="eyebrow" style="margin:8px 0 4px">${g}</div>${ks.map(k => { const v = scoutedHide ? null : p.r[k]; return `<div class="rbar"><span class="mute">${RLONG[k]}</span><span class="num b">${v == null ? '??' : v}</span><div class="bar"><i style="width:${v == null ? 0 : v}%;background:${v >= 85 ? 'var(--gold)' : v >= 70 ? 'var(--good)' : v >= 55 ? 'var(--info)' : 'var(--bad)'}"></i></div></div>`; }).join('')}</div>`).join('');
  const aw = {};
  p.awards.forEach(a => { (aw[a.t] = aw[a.t] || []).push(a.s); });
  const awards = Object.keys(aw).sort((a, b) => aw[b].length - aw[a].length).map(k => `<span class="chip gold" title="${aw[k].map(U.seasonLabel).join(', ')}">${aw[k].length > 1 ? aw[k].length + '× ' : ''}${AWARD_NAMES[k] || k}</span>`).join(' ');
  const own = p.tid === S.user;
  const actions = [];
  if (own) {
    actions.push(`<label class="row tight small" style="margin-right:auto">Position <select data-c="setPos" data-id="${p.pid}" aria-label="Change position">${POSS.map(x => `<option value="${x}" ${x === p.pos ? 'selected' : ''}>${x} (${calcOvr(p.r, x)})</option>`).join('')}</select></label>`);
    actions.push(btn(S.tradeBlock.includes(p.pid) ? 'Remove from Block' : 'Add to Trading Block', 'toggleBlock', '', { id: p.pid }));
    if (canExtend(S, p)) actions.push(btn('Extend Contract', 'negotiateOpen', 'gold', { id: p.pid }));
    if (S.phase === PH.RESIGN && p.contract.exp <= S.season) actions.push(btn('Negotiate', 'negotiateOpen', 'gold', { id: p.pid }));
    actions.push(btn('Release', 'releaseAsk', 'red', { id: p.pid }));
  } else if (p.tid >= 0) actions.push(btn('Trade For', 'tradeFor', 'gold', { id: p.pid }));
  else if (p.tid === -1) actions.push(btn('Make Offer', 'faOfferOpen', 'gold', { id: p.pid }));
  else if (retireBtn) actions.push(retireBtn);
  const spark = p.hist.length > 1 ? sparkline(p.hist.map(h => h.ovr).concat([p.ovr])) : '';
  const body = `<div class="pc-top">
      <div class="pc-num">${p.tid >= 0 ? '#' + p.num : ''}</div>
      <div style="min-width:0"><div class="row tight">${t ? logo(t, 26) : ''}<span class="eyebrow">${t ? E(tname(t)) : p.tid === -1 ? 'Free Agent' : p.tid === -2 ? `${p.dyear} Draft Prospect` : 'Retired'}</span></div>
        <div class="small mute" style="margin-top:4px">${p.pos} · ${E(p.arch)} · ${U.hgt(p.hgt)}, ${p.wgt} lbs · Age ${p.age} · ${E(p.college)}${p.country !== 'USA' ? '' : ''}</div>
        <div class="row tight" style="margin-top:6px"><span class="chip" title="${E(PERSONALITIES[p.pers].d)}">${PERSONALITIES[p.pers].n}</span>${moodIcon(p.morale)}${injChip(p)}${t ? `<span class="chip">${roleName(ranks[p.pid])}</span>` : ''}${p.draft && p.draft.rd ? `<span class="chip">${p.draft.year} R${p.draft.rd} #${p.draft.pick}</span>` : ''}</div></div>
      <div class="pc-ovr"><div class="eyebrow">Overall</div><div class="v">${scoutedHide ? `~${pr.ovr}` : p.ovr}</div><div class="small">Potential ${gradeChip(potGrade(Math.max(scoutedHide ? pr.pot : p.pot, scoutedHide ? pr.ovr : p.ovr)))}</div></div>
    </div>
    ${awards ? `<div class="row tight" style="margin-top:10px">${awards}</div>` : ''}
    <div class="grid g2" style="margin-top:12px"><div>${bars}</div><div class="stack">
      ${panel('Contract', p.tid >= 0 ? `<div class="kv small"><span>Salary</span><span>${U.money(p.contract.amt)}</span><span>Through</span><span>${U.seasonLabel(p.contract.exp)}</span><span>Market value</span><span>${U.money(marketSalary(S, p))}</span>${p.contract.next ? `<span>Extension</span><span class="gold">${U.money(p.contract.next)} from ${U.seasonLabel(S.season + 1)}</span>` : ''}${p.contract.rookie ? '<span>Type</span><span>Rookie scale</span>' : ''}${p.contract.ng ? '<span>Guaranteed</span><span>No</span>' : ''}</div>` : p.tid === -1 ? `<div class="kv small"><span>Asking</span><span>${U.money((p.ask || contractAsk(S, p, -1)).amt)} × ${(p.ask || contractAsk(S, p, -1)).yrs}</span></div>` : '<span class="mute small">—</span>')}
      ${spark ? panel('Overall by Season', spark) : ''}
      ${p.tid === -2 ? panel('Combine', combineHtml(p)) : ''}
    </div></div>
    <div style="margin-top:14px">${careerTable(S, p)}</div>`;
  modal(`${E(pname(p))}`, body, actions.join(''), { size: '' });
}
function sparkline(vals) {
  const w = 300, h = 90, mn = Math.min(...vals) - 2, mx = Math.max(...vals) + 2;
  const pts = vals.map((v, i) => [10 + i * (w - 20) / Math.max(1, vals.length - 1), h - 12 - (v - mn) / (mx - mn) * (h - 24)]);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Overall rating history"><path d="M${pts.map(p => p.join(',')).join(' L')} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h}Z" fill="rgba(255,182,39,.12)"/><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#ffb627" stroke-width="2"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 4 : 2.5}" fill="#ffb627"/><text x="${p[0]}" y="${p[1] - 7}" fill="#e8eef8" font-size="10" text-anchor="middle" font-family="Chakra Petch, monospace">${vals[i]}</text>`).join('')}</svg>`;
}
function combineHtml(p) {
  const r = p.r;
  const ws = p.hgt + Math.round((r.blk - 50) / 12 + (r.idf - 50) / 20 + 3);
  return `<div class="kv small"><span>Height (shoes)</span><span>${U.hgt(p.hgt + 1)}</span><span>Wingspan</span><span>${U.hgt(ws)}</span><span>Max vertical</span><span>${(26 + (r.jmp - 40) * 0.28).toFixed(1)}"</span><span>Lane agility</span><span>${(12.4 - (r.spd - 40) * 0.025).toFixed(2)}s</span><span>3/4 sprint</span><span>${(3.62 - (r.spd - 40) * 0.006).toFixed(2)}s</span><span>Bench (185 lb)</span><span>${Math.max(0, Math.round((r.str - 30) / 4))} reps</span></div>`;
}
function careerTable(S, p) {
  const rows = p.stats.slice().sort((a, b) => a.s - b.s || a.po - b.po);
  if (!rows.length) return '<div class="empty small">No games played yet.</div>';
  const cols = [{ l: 'Season', f: r => r.s ? U.seasonLabel(r.s) + (r.po ? ' <span class="chip">PO</span>' : '') : 'Career' + (r.po ? ' (PO)' : '') }, { l: 'Team', f: r => r.tid >= 0 && S.teams[r.tid] ? S.teams[r.tid].abbr : '—' },
  { l: 'GP', n: 1, f: r => r.gp }, { l: 'GS', n: 1, f: r => r.gs }, { l: 'MPG', n: 1, f: r => (r.min / r.gp).toFixed(1) }, { l: 'PTS', n: 1, f: r => (r.pts / r.gp).toFixed(1) }, { l: 'REB', n: 1, f: r => ((r.orb + r.drb) / r.gp).toFixed(1) },
  { l: 'AST', n: 1, f: r => (r.ast / r.gp).toFixed(1) }, { l: 'STL', n: 1, f: r => (r.stl / r.gp).toFixed(1) }, { l: 'BLK', n: 1, f: r => (r.blk / r.gp).toFixed(1) }, { l: 'FG%', n: 1, f: r => U.fg(r.fgm, r.fga) }, { l: '3P%', n: 1, f: r => U.fg(r.tpm, r.tpa) }, { l: 'FT%', n: 1, f: r => U.fg(r.ftm, r.fta) }];
  const reg = careerTotals(p, 0);
  const all = rows.filter(r => r.gp > 0).concat(reg.gp && rows.some(r => r.s) ? [Object.assign({ s: 0, tid: -1, po: 0 }, reg)] : []);
  return `<div class="tw"><table class="t"><thead><tr>${cols.map(c => `<th class="${c.n ? 'n' : ''}">${c.l}</th>`).join('')}</tr></thead><tbody>${all.map(r => `<tr class="${r.s ? '' : 'sep'}">${cols.map(c => `<td class="${c.n ? 'n' : ''}">${c.f(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function canRetireNum(S, p) {
  if (p.tid !== -3) return false;
  const t = S.teams[S.user];
  if ((t.rafters || []).some(r => r.pid === p.pid || r.num === p.num)) return false;
  const yrs = new Set(p.stats.filter(r => r.tid === S.user && !r.po && r.s).map(r => r.s)).size;
  return yrs >= 4 || (p.hof && yrs >= 1);
}
Act.retireNum = el => {
  const S = App.S, p = P(S, +el.dataset.id), t = S.teams[S.user];
  confirmBox(`Retire #${p.num}?`, `No ${E(t.name)} player will wear #${p.num} again. ${E(pname(p))}'s banner goes up in the rafters at ${E(t.arena.name)}.`, 'Raise the Banner', () => {
    t.rafters = t.rafters || [];
    t.rafters.push({ num: p.num, n: pname(p), pid: p.pid, s: S.season });
    t.hype = Math.min(100, t.hype + 3); t.fan = Math.min(100, t.fan + 3);
    assignNumbers(S, t.tid);
    addNews(S, { type: 'ceremony', tids: [t.tid], pids: [p.pid], h: `${t.name} retire ${pname(p)}'s No. ${p.num}`, b: `A sellout crowd at ${t.arena.name} gave him a standing ovation as the banner went up.`, imp: 3, local: true });
    closeModal(); autosave(); rerender(); toast(`#${p.num} raised to the rafters.`, 'good');
  });
};
Act.setPos = el => {
  const S = App.S, p = P(S, +el.dataset.id), np = el.value;
  if (np === p.pos) return;
  const before = p.ovr;
  p.pos = np; p.ovr = calcOvr(p.r, np); p.pot = Math.max(p.ovr, p.pot + (p.ovr - before));
  ensureRotation(S, S.user); autosave();
  toast(`${pname(p)} moves to ${np} (${before} → ${p.ovr} OVR).`);
  openPlayer(p.pid); rerender();
};
Act.toggleBlock = el => {
  const S = App.S, id = +el.dataset.id;
  if (S.tradeBlock.includes(id)) { S.tradeBlock = S.tradeBlock.filter(x => x !== id); toast('Removed from the trading block.'); }
  else { S.tradeBlock.push(id); toast('On the block. Offers will arrive in your inbox.'); }
  closeModal(); autosave(); rerender();
};
Act.releaseAsk = el => {
  const S = App.S, p = P(S, +el.dataset.id);
  const ng = p.contract.ng || p.contract.amt <= S.minSal * 1.05;
  const yrs = p.contract.exp - firstSeason(S) + 1;
  confirmBox(`Release ${E(pname(p))}?`, ng ? 'His contract is not guaranteed. No dead money.' : `You still owe him ${U.money(p.contract.amt)} a season for ${Math.max(1, yrs)} more season${yrs > 1 ? 's' : ''}. That stays on your cap as dead money.`, 'Release', () => { releasePlayer(S, p); autosave(); toast(`${pname(p)} released.`); rerender(); }, 'red');
};
Act.tradeFor = el => { const p = P(App.S, +el.dataset.id); App.trade = { tid: p.tid, give: { pids: [], picks: [] }, get: { pids: [p.pid], picks: [] } }; closeModal(); go('trade'); };

// ---------- negotiation (re-sign / extension) ----------
const canNegotiate = (S, p) => p && p.tid === S.user && (canExtend(S, p) || (S.phase === PH.RESIGN && p.contract.exp <= S.season));
Act.negotiateOpen = el => {
  const S = App.S, p = P(S, +el.dataset.id);
  if (!canNegotiate(S, p)) { toast(p && p.contract.next ? 'He already signed an extension.' : 'He is not yours to negotiate with right now.', 'bad'); S.inbox.forEach(m => { if (m.act && m.act.kind === 'ext' && m.act.pid === (p && p.pid)) m.done = true; }); rerender(); return; }
  const st = resignStatus(S, p);
  if (st === 'refuses') { modal(E(pname(p)), `<p>${E(pname(p))} refuses to negotiate. He'll test free agency.</p>`, '', { size: 'sm' }); return; }
  const ask = contractAsk(S, p, p.tid);
  App.neg = { pid: p.pid, amt: ask.amt, yrs: ask.yrs };
  negModal();
};
function negModal(msg) {
  const S = App.S, N = App.neg, p = P(S, N.pid);
  const ask = contractAsk(S, p, p.tid);
  const st = resignStatus(S, p);
  const body = `<div class="row" style="margin-bottom:10px">${rt(p.ovr)}<div><div class="b">${E(pname(p))} · ${p.pos} · ${p.age}</div><div class="small mute">${PERSONALITIES[p.pers].n} · ${moodWord(p.morale)} · ${st === 'testing' ? '<span class="warn">Wants to test the market</span>' : '<span class="good">Open to staying</span>'}</div></div></div>
  <div class="kv small"><span>Agent's ask</span><span class="gold">${U.money(ask.amt)} × ${ask.yrs} yrs</span><span>Market value</span><span>${U.money(marketSalary(S, p))}</span><span>Your payroll next year</span><span>${U.money(payrollNext(S, S.user) - (offseason(S) ? 0 : 0))}</span><span>Talks so far</span><span>${p.neg || 0} of 3 offers</span></div>
  <hr class="sep">
  <label class="fld">Salary per season: <b class="num" id="negAmtL">${U.money(N.amt)}</b><input type="range" min="${S.minSal}" max="${S.maxSal}" step="50" value="${N.amt}" data-i="negAmt"></label>
  <div class="fld" style="margin-top:10px">Years ${seg('negYrs', [1, 2, 3, 4, 5].map(y => [y, y]), N.yrs, 'negYrs')}</div>
  ${msg ? `<p class="${msg.ok ? 'good' : 'warn'}" style="margin-top:12px">${E(msg.msg)}</p>` : ''}`;
  modal(`${canExtend(S, p) ? 'Extension' : 'Re-sign'} Talks`, body, msg && msg.ok ? btn('Done', 'closeModal', 'gold') : `${btn('Walk Away', 'closeModal', 'ghost')}${btn('Make Offer', 'negSubmit', 'gold')}`, { size: 'sm' });
}
Act.negAmt = el => { App.neg.amt = +el.value; const l = $('#negAmtL'); if (l) l.textContent = U.money(App.neg.amt); };
Act.negYrs = el => { App.neg.yrs = +el.dataset.k; negModal(); };
Act.negSubmit = () => { const S = App.S, N = App.neg; if (!canNegotiate(S, P(S, N.pid))) { closeModal(); toast('These talks are over.', 'bad'); return; } const res = negotiate(S, P(S, N.pid), N.amt, N.yrs); autosave(); negModal(res); if (res.ok) { toast(res.msg, 'good'); setTimeout(rerender, 10); } };

// ---------- rotation & strategy ----------
Screens.rotation = {
  render() {
    const S = App.S, t = S.teams[S.user];
    ensureRotation(S, S.user);
    const order = t.rot.order.map(id => P(S, id));
    const tot = U.sum(order, p => t.rot.mins[p.pid] || 0);
    const rows = order.map((p, i) => `<tr class="${i === 5 ? 'sep' : ''}"><td class="c">${i < 5 ? '<span class="chip gold">START</span>' : `<span class="dim">${i + 1}</span>`}</td><td>${plink(p)} ${injChip(p)}</td><td>${p.pos}</td><td class="c">${rt(p.ovr)}</td><td class="n">${p.r.sta}</td><td>${moodIcon(p.morale)}</td>
      <td class="n"><input type="number" min="0" max="48" value="${t.rot.mins[p.pid] || 0}" style="width:64px" data-c="rotMin" data-id="${p.pid}" ${t.autoRot ? 'disabled' : ''} aria-label="Minutes for ${E(pname(p))}"></td>
      <td><div class="row tight">${t.autoRot ? '' : `${btn('▲', 'rotMove', 'sm ghost', { id: p.pid, d: -1 })}${btn('▼', 'rotMove', 'sm ghost', { id: p.pid, d: 1 })}`}</div></td></tr>`).join('');
    const strat = t.strat;
    const calls = (map, cur, act) => `<div class="callgrid">${Object.entries(map).map(([k, v]) => `<button class="call ${cur === k ? 'on' : ''}" data-a="${act}" data-k="${k}"><b>${v.n}</b><span class="mute">${v.d}</span></button>`).join('')}</div>`;
    return `${pageHead('Rotation & Strategy', 'Your lineup, minutes and default game plan for simulated games')}
    <div class="grid g-main">
      ${panel('Rotation', `<div class="row between" style="padding:10px 12px"><label class="row small"><input type="checkbox" ${t.autoRot ? 'checked' : ''} data-c="autoRot"> Let the coaching staff set the rotation automatically</label><span class="num ${Math.abs(tot - 240) > 5 && !t.autoRot ? 'warn' : 'mute'}">${tot} / 240 min</span></div>
        <div class="tw"><table class="t"><thead><tr><th class="c">Slot</th><th>Player</th><th>Pos</th><th class="c">OVR</th><th class="n">STA</th><th>Mood</th><th class="n">Min</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
        <p class="tiny mute" style="padding:0 12px 10px">Minutes are targets; the engine scales them to 240 and subs on fatigue and fouls. Unhappy with playing time? Check the inbox.</p>`, { flush: true })}
      <div class="stack">
        ${panel('Default Offense', calls(OFF_PLAYS, strat.off, 'stratOff'))}
        ${panel('Default Defense', calls(DEF_SCHEMES, strat.def, 'stratDef'))}
        ${panel('Pace', seg('pace', PACES.map((p, i) => [i, p]), strat.pace, 'stratPace'))}
      </div>
    </div>`;
  },
};
Act.autoRot = el => { const S = App.S, t = S.teams[S.user]; t.autoRot = el.checked; if (t.autoRot) autoRotation(S, S.user); autosave(); rerender(); };
Act.rotMin = el => { const t = App.S.teams[App.S.user]; t.rot.mins[+el.dataset.id] = U.clamp(+el.value || 0, 0, 48); autosave(); rerender(); };
Act.rotMove = el => {
  const t = App.S.teams[App.S.user], id = +el.dataset.id, d = +el.dataset.d;
  const i = t.rot.order.indexOf(id), j = i + d;
  if (j < 0 || j >= t.rot.order.length) return;
  [t.rot.order[i], t.rot.order[j]] = [t.rot.order[j], t.rot.order[i]];
  if ((i < 5) !== (j < 5)) { const a = t.rot.order[i], b = t.rot.order[j]; [t.rot.mins[a], t.rot.mins[b]] = [t.rot.mins[b], t.rot.mins[a]]; }
  autosave(); rerender();
};
Act.stratOff = el => { App.S.teams[App.S.user].strat.off = el.dataset.k; autosave(); rerender(); };
Act.stratDef = el => { App.S.teams[App.S.user].strat.def = el.dataset.k; autosave(); rerender(); };
Act.stratPace = el => { App.S.teams[App.S.user].strat.pace = +el.dataset.k; autosave(); rerender(); };

// ---------- schedule & box scores ----------
Screens.schedule = {
  render() {
    const S = App.S, u = S.user;
    const gs = teamGames(S, u);
    const rows = gs.map(g => {
      const home = g.h === u, opp = S.teams[home ? g.a : g.h];
      const played = g.hs != null;
      const won = played && (home ? g.hs > g.as : g.as > g.hs);
      return `<tr class="${g.day === S.day && S.phase === PH.REG ? 'me' : ''}"><td class="n">${g.day}</td><td>${home ? 'vs' : '@'}</td><td><span class="row tight">${logo(opp, 20)} ${tlink(opp, true)}</span></td><td class="mute small">${rec(opp)}</td>
        <td>${played ? `<span class="${won ? 'good' : 'bad'} b">${won ? 'W' : 'L'}</span> <span class="num">${home ? g.hs : g.as}-${home ? g.as : g.hs}${g.ot ? ' OT' : ''}</span>` : '<span class="dim">—</span>'}</td>
        <td>${played && S.box[g.gid] ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : ''}</td></tr>`;
    }).join('');
    const po = S.playoffs ? S.playoffs.games.filter(g => g.h === u || g.a === u) : [];
    const poRows = po.map(g => { const home = g.h === u, opp = S.teams[home ? g.a : g.h]; const won = home ? g.hs > g.as : g.as > g.hs; return `<tr><td>${ROUND_NAMES[g.round]} G${g.n}</td><td>${home ? 'vs' : '@'} ${tlink(opp, true)}</td><td><span class="${won ? 'good' : 'bad'} b">${won ? 'W' : 'L'}</span> <span class="num">${home ? g.hs : g.as}-${home ? g.as : g.hs}</span></td><td>${S.box[g.gid] ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : ''}</td></tr>`; }).join('');
    const lastDay = S.phase === PH.REG ? S.day - 1 : 0;
    const board = S.phase === PH.REG ? S.sched.filter(g => g.day === lastDay && g.hs != null) : [];
    const slate = S.phase === PH.REG ? S.sched.filter(g => g.day === S.day) : [];
    const sb = board.length || slate.length ? panel(`Around the League`, `<div class="grid g2" style="gap:6px">${board.map(g => `<div class="row between small" style="padding:6px 8px;background:var(--panel2);border-radius:4px"><span><b class="${g.as > g.hs ? '' : 'mute'}">${S.teams[g.a].abbr} ${g.as}</b> @ <b class="${g.hs > g.as ? '' : 'mute'}">${S.teams[g.h].abbr} ${g.hs}</b>${g.ot ? ' OT' : ''}</span>${S.box[g.gid] ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : ''}</div>`).join('')}</div>${board.length ? `<div class="tiny mute" style="margin:6px 0 10px">Day ${lastDay} finals</div>` : ''}${slate.length ? `<div class="eyebrow" style="margin:8px 0 4px">Today, Day ${S.day}</div><div class="small">${slate.map(g => `${S.teams[g.a].abbr} @ ${S.teams[g.h].abbr}`).join(' · ')}</div>` : ''}`, { style: 'margin-bottom:14px' }) : '';
    return `${pageHead('Schedule', `${U.seasonLabel(S.season)} · All-Star break after Day ${S.allStarDay - 1} · Trade deadline Day ${S.deadlineDay}`)}
      ${sb}
      ${poRows ? panel('Playoffs', `<div class="tw"><table class="t"><tbody>${poRows}</tbody></table></div>`, { flush: true, style: 'margin-bottom:14px' }) : ''}
      ${panel('Regular Season', `<div class="tw"><table class="t"><thead><tr><th class="n">Day</th><th></th><th>Opponent</th><th>Record</th><th>Result</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`, { flush: true })}`;
  },
};
Act.box = el => openBox(+el.dataset.gid);
function boxTable(S, T, b) {
  const cols = ['MIN', 'PTS', 'FG', '3PT', 'FT', 'OREB', 'REB', 'AST', 'STL', 'BLK', 'TO', 'PF', '+/-'];
  const tot = newLine();
  const rows = T.ps.map(l => { for (const k in tot) tot[k] += l[k] || 0; return `<tr><td>${l.gs ? '<b>' : ''}<a class="pl" data-a="player" data-id="${l.pid}">${E(l.n)}</a>${l.gs ? '</b>' : ''} <span class="dim small">${l.pos}</span></td><td class="n">${Math.round(l.min)}</td><td class="n b">${l.pts}</td><td class="n">${l.fgm}-${l.fga}</td><td class="n">${l.tpm}-${l.tpa}</td><td class="n">${l.ftm}-${l.fta}</td><td class="n">${l.orb}</td><td class="n">${l.orb + l.drb}</td><td class="n">${l.ast}</td><td class="n">${l.stl}</td><td class="n">${l.blk}</td><td class="n">${l.tov}</td><td class="n">${l.pf}</td><td class="n ${l.pm > 0 ? 'good' : l.pm < 0 ? 'bad' : ''}">${l.pm > 0 ? '+' : ''}${l.pm}</td></tr>`; }).join('');
  const tr = `<tr class="sep"><td class="b">Totals</td><td></td><td class="n b">${tot.pts}</td><td class="n">${tot.fgm}-${tot.fga}<div class="tiny mute">${U.fg(tot.fgm, tot.fga)}</div></td><td class="n">${tot.tpm}-${tot.tpa}<div class="tiny mute">${U.fg(tot.tpm, tot.tpa)}</div></td><td class="n">${tot.ftm}-${tot.fta}<div class="tiny mute">${U.fg(tot.ftm, tot.fta)}</div></td><td class="n">${tot.orb}</td><td class="n">${tot.orb + tot.drb}</td><td class="n">${tot.ast}</td><td class="n">${tot.stl}</td><td class="n">${tot.blk}</td><td class="n">${tot.tov}</td><td class="n">${tot.pf}</td><td></td></tr>`;
  return `<div class="tw"><table class="t"><thead><tr><th>Player</th>${cols.map(c => `<th class="n">${c}</th>`).join('')}</tr></thead><tbody>${rows}${tr}</tbody></table></div>`;
}
function openBox(gid) {
  const S = App.S, b = S.box[gid];
  if (!b) { toast('Box score not available.'); return; }
  const tm = i => S.teams[b.teams[i].tid] || { abbr: b.teams[i].abbr, tid: 0, c1: '#555', c2: '#999', region: b.teams[i].abbr, name: '' };
  const qh = b.qs[0].map((_, i) => `<th class="n">${i < 4 ? i + 1 : 'OT' + (i > 4 ? i - 3 : '')}</th>`).join('');
  const qrow = i => `<tr><td class="b">${E(tm(i).abbr)}</td>${b.qs[i].map(x => `<td class="n">${x}</td>`).join('')}<td class="n b">${b.score[i]}</td></tr>`;
  const body = `<div class="row" style="justify-content:center;gap:24px;margin-bottom:12px">${logo(tm(1), 52)}<div class="c"><div style="font:700 40px/1 var(--f-num)">${b.score[1]} – ${b.score[0]}</div><div class="small mute">Final${b.ot ? ' / ' + (b.ot > 1 ? b.ot : '') + 'OT' : ''}</div></div>${logo(tm(0), 52)}</div>
    <div class="tw" style="max-width:420px;margin:0 auto 14px"><table class="t"><thead><tr><th></th>${qh}<th class="n">T</th></tr></thead><tbody>${qrow(1)}${qrow(0)}</tbody></table></div>
    ${[1, 0].map(i => `<div class="eyebrow" style="margin:12px 0 6px">${E(tm(i).abbr)}</div>${boxTable(S, b.teams[i], b)}`).join('')}
    ${b.log ? `<details style="margin-top:14px"><summary class="b" style="cursor:pointer">Play-by-play</summary><div class="pbp" style="max-height:420px">${b.log.slice().reverse().map(e => `<div class="e ${e[6] ? 'score' : ''}"><span class="t">Q${e[0]} ${Math.floor(e[1] / 60)}:${String(e[1] % 60).padStart(2, '0')}</span><span>${E(e[3])}</span><span class="s">${e[5]}-${e[4]}</span></div>`).join('')}</div></details>` : ''}
    ${b.shots ? `<details style="margin-top:10px"><summary class="b" style="cursor:pointer">Shot chart</summary><div class="grid g2" style="margin-top:8px">${[1, 0].map(i => `<div><div class="eyebrow">${E(tm(i).abbr)}</div>${shotChart(b.shots.filter(s => s.side === i), tm(i))}</div>`).join('')}</div></details>` : ''}`;
  modal(`${E(tm(1).abbr)} @ ${E(tm(0).abbr)}`, body, '', {});
}
function shotChart(shots, t) {
  const W = 500, H = 470, sx = x => W / 2 + x * 10, sy = y => H - y * 10;
  const court = `<rect x="0" y="0" width="${W}" height="${H}" fill="#2a1b10"/><g stroke="#c98d4e" stroke-width="2" fill="none" opacity=".7"><rect x="${sx(-8)}" y="${sy(19)}" width="160" height="190"/><circle cx="${sx(0)}" cy="${sy(19)}" r="60"/><path d="M${sx(-22)},${H} L${sx(-22)},${sy(14)} A237.5,237.5 0 0 1 ${sx(22)},${sy(14)} L${sx(22)},${H}"/><circle cx="${sx(0)}" cy="${sy(5.25)}" r="7.5" stroke="#ff7a1a"/><line x1="${sx(-3)}" y1="${sy(4)}" x2="${sx(3)}" y2="${sy(4)}"/></g>`;
  const dots = shots.map(s => s.made ? `<circle cx="${sx(s.x)}" cy="${sy(Math.min(46, s.y))}" r="6" fill="${t.c1}" stroke="#fff" stroke-width="1.5"/>` : `<g stroke="#ff5d5d" stroke-width="2.5" opacity=".85"><line x1="${sx(s.x) - 5}" y1="${sy(Math.min(46, s.y)) - 5}" x2="${sx(s.x) + 5}" y2="${sy(Math.min(46, s.y)) + 5}"/><line x1="${sx(s.x) + 5}" y1="${sy(Math.min(46, s.y)) - 5}" x2="${sx(s.x) - 5}" y2="${sy(Math.min(46, s.y)) + 5}"/></g>`).join('');
  const m = shots.filter(s => s.made).length;
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;border-radius:4px" role="img" aria-label="Shot chart: ${m} of ${shots.length} made">${court}${dots}</svg><div class="tiny mute c">${m}/${shots.length} FG · ● made · ✕ missed</div>`;
}

// ---------- training camp ----------
Screens.camp = {
  render() {
    const S = App.S;
    if (S.phase !== PH.PRE || !S.camp) return `${pageHead('Training Camp')}<div class="empty">Training camp opens in the preseason.</div>`;
    const sel = App.ui.campPid != null ? P(S, App.ui.campPid) : null;
    const ps = U.sortBy(roster(S, S.user), p => (p.age <= 24 ? 10 : 0) + p.pot);
    const list = ps.map(p => `<button class="tcard ${sel && sel.pid === p.pid ? 'on' : ''}" style="width:100%" data-a="campPick" data-id="${p.pid}" ${p.campYr === S.season ? 'disabled' : ''}>${rt(p.ovr)}<div class="grow"><div class="b">${E(pname(p))}</div><div class="tiny mute">${p.pos} · Age ${p.age} · POT ${potGrade(Math.max(p.pot, p.ovr))}${p.campYr === S.season ? ' · already drilled' : ''}</div></div></button>`).join('');
    const drills = Object.entries(DRILLS).map(([k, d]) => `<button class="call" style="padding:10px" data-a="campDrill" data-k="${k}" ${!sel || !S.camp.left ? 'disabled' : ''}><b>${d.n}</b><span class="mute">${d.d}</span><div class="tiny" style="margin-top:4px">${d.keys.map(x => RSHORT[x] + (sel ? ' ' + sel.r[x] : '')).join(' · ')}</div>${d.game ? '<span class="chip gold" style="margin-top:6px">Playable</span>' : '<span class="chip" style="margin-top:6px">Simulated</span>'}</button>`).join('');
    const log = S.camp.log.map(r => `<tr><td>${E(r.n)}</td><td>${DRILLS[r.drill].n}</td><td class="c">${gradeChip(U.grade(r.grade))}</td><td>${Object.entries(r.gains).map(([k, v]) => `${RSHORT[k]} <span class="${v > 0 ? 'good' : 'mute'}">+${v}</span>`).join(' · ')}</td><td class="n ${r.d > 0 ? 'good' : ''}">${r.d > 0 ? '+' + r.d : r.d} OVR</td></tr>`).join('');
    return `${pageHead('Training Camp', `${S.camp.left} session${S.camp.left === 1 ? '' : 's'} remaining · each player can attend one session`, btn('Start Season', 'advStart', 'gold'))}
      <div class="grid g-main"><div class="stack">${panel(sel ? `Drills for ${E(pname(sel))}` : 'Pick a player', `<div class="callgrid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr))">${drills}</div>`)}
      ${panel('Camp Results', log ? `<div class="tw"><table class="t"><tbody>${log}</tbody></table></div>` : '<div class="empty">No sessions run yet.</div>', { flush: true })}</div>
      ${panel('Players', `<div class="stack" style="gap:6px;max-height:620px;overflow-y:auto">${list}</div>`)}</div>`;
  },
};
Act.campPick = el => { App.ui.campPid = +el.dataset.id; rerender(); };
Act.campDrill = el => {
  const S = App.S, k = el.dataset.k, p = P(S, App.ui.campPid);
  if (!p || !S.camp.left) return;
  const finish = (grade) => {
    const r = campApply(S, p.pid, k, grade);
    App.ui.campPid = null;
    autosave();
    if (r) modal('Drill Complete', `<div class="c"><div class="eyebrow">${DRILLS[k].n}</div><div style="font:800 56px/1 var(--f-num);color:var(--gold);margin:8px 0">${U.grade(grade)}</div><p>${E(r.n)}: ${Object.entries(r.gains).map(([x, v]) => `${RLONG[x]} +${v}`).join(', ')}${r.d ? ` · <b class="good">+${r.d} OVR</b>` : ''}</p></div>`, btn('Continue', 'closeModal', 'gold'), { size: 'sm', onClose: rerender });
    else rerender();
  };
  if (DRILLS[k].game) MiniGames[DRILLS[k].game](p, finish);
  else finish(campSimGrade(S, p));
};

// ===== ui/screens_league.js — standings, stats, playoffs, history, All-Star, review =====
function standingsTable(S, list, id, opts = {}) {
  const lead = list[0];
  return sortTable(id, [
    { l: '#', f: x => list.indexOf(x) + 1 },
    { l: 'Team', f: x => `<span class="row tight">${logo(x, 22)} ${tlink(x, true)}${opts.seeds && list.indexOf(x) < 8 ? ` <span class="chip ${list.indexOf(x) < 8 ? 'good' : ''}">${list.indexOf(x) + 1}</span>` : ''}</span>` },
    { l: 'W', n: 1, f: x => x.rec.w }, { l: 'L', n: 1, f: x => x.rec.l }, { l: 'PCT', n: 1, f: x => U.fg(x.rec.w, x.rec.w + x.rec.l) },
    { l: 'GB', n: 1, f: x => { const g = gamesBack(lead, x); return g > 0 ? g.toFixed(1) : '—'; } },
    { l: 'Home', n: 1, f: x => `${x.rec.hw}-${x.rec.hl}` }, { l: 'Away', n: 1, f: x => `${x.rec.aw}-${x.rec.al}` },
    { l: 'Conf', n: 1, f: x => `${x.rec.cw}-${x.rec.cl}` }, { l: 'Div', n: 1, f: x => `${x.rec.dw}-${x.rec.dl}` },
    { l: 'PF', n: 1, f: x => x.rec.w + x.rec.l ? (x.rec.pf / (x.rec.w + x.rec.l)).toFixed(1) : '—' }, { l: 'PA', n: 1, f: x => x.rec.w + x.rec.l ? (x.rec.pa / (x.rec.w + x.rec.l)).toFixed(1) : '—' },
    { l: 'Diff', n: 1, f: x => { const g = x.rec.w + x.rec.l; if (!g) return '—'; const d = (x.rec.pf - x.rec.pa) / g; return `<span class="${d >= 0 ? 'good' : 'bad'}">${d >= 0 ? '+' : ''}${d.toFixed(1)}</span>`; } },
    { l: 'Strk', f: x => streakStr(x) }, { l: 'L10', f: x => `${x.rec.l10.filter(y => y).length}-${x.rec.l10.filter(y => !y).length}` },
  ], list, { rowCls: x => (x.tid === S.user ? 'me' : '') + (opts.seeds && list.indexOf(x) === 8 ? ' sep' : '') });
}
Screens.standings = {
  render() {
    const S = App.S;
    const tb = tabs('stand', [['conf', 'Conference'], ['div', 'Division'], ['league', 'League'], ['power', 'Power Rankings']], 'conf');
    let body = '';
    if (tb.cur === 'conf') body = [0, 1].map(c => panel(`${CONFS[c]}ern Conference`, standingsTable(S, confSeeds(S, c), 'sc' + c, { seeds: true }), { flush: true, style: 'margin-bottom:14px' })).join('') + '<p class="tiny mute">Top eight in each conference make the playoffs. Division winners are guaranteed a top-three seed.</p>';
    else if (tb.cur === 'div') body = `<div class="grid g2">${DIVS.map((d, i) => panel(d, standingsTable(S, standings(S, t => t.div === i), 'sd' + i), { flush: true })).join('')}</div>`;
    else if (tb.cur === 'league') body = panel('League', standingsTable(S, standings(S), 'sl'), { flush: true });
    else {
      const pr = S.power || powerRankings(S);
      body = panel('Power Rankings', sortTable('pw', [{ l: 'Rank', n: 1, f: x => `<b>${x.rank}</b>` }, { l: '', f: x => { const d = x.prev - x.rank; return d > 0 ? `<span class="good">▲${d}</span>` : d < 0 ? `<span class="bad">▼${-d}</span>` : '<span class="dim">—</span>'; } },
        { l: 'Team', f: x => `<span class="row tight">${logo(S.teams[x.tid], 22)} ${tlink(S.teams[x.tid], true)}</span>` }, { l: 'Record', f: x => rec(S.teams[x.tid]) }, { l: 'Top-8 OVR', n: 1, f: x => teamStrength(S, x.tid).toFixed(1) }], pr, { rowCls: x => x.tid === S.user ? 'me' : '' }), { flush: true });
    }
    return `${pageHead('Standings', phaseLine(S))}${tb.html}${body}`;
  },
};

Screens.stats = {
  render() {
    const S = App.S;
    const tb = tabs('stats', [['leaders', 'League Leaders'], ['races', 'Award Races'], ['players', 'Player Stats'], ['teams', 'Team Stats']], 'leaders');
    const po = S.playoffs && App.ui.statPO ? 1 : 0;
    const G = S.settings.games;
    const all = S.players.filter(p => p.tid >= 0).map(p => ({ p, t: seasonTotals(p, S.season, po) })).filter(x => x.t.gp > 0).map(x => Object.assign(x, { pg: perGame(x.t) }));
    const tgp = po ? Math.max(1, U.avg(S.teams.filter(t => S.playoffs && S.playoffs.seeds.flat().includes(t.tid)), t => S.playoffs.games.filter(g => g.h === t.tid || g.a === t.tid).length)) : Math.max(1, U.avg(S.teams, t => t.rec.w + t.rec.l));
    const minG = po ? 1 : Math.max(1, Math.floor(tgp * 0.5));
    let body = '';
    if (tb.cur === 'leaders') {
      const cats = [['Points', 'ppg', 1], ['Rebounds', 'rpg', 1], ['Assists', 'apg', 1], ['Steals', 'spg', 1], ['Blocks', 'bpg', 1], ['FG%', 'fgp', 3, x => x.t.fgm >= tgp * 3], ['3P%', 'tpp', 3, x => x.t.tpm >= tgp * 0.9], ['FT%', 'ftp', 3, x => x.t.ftm >= tgp * 1.5], ['Efficiency', 'eff', 1]];
      body = `<div class="grid g3">${cats.map(([l, k, d, q]) => {
        const list = U.sortBy(all.filter(x => x.t.gp >= minG && (!q || q(x))), x => x.pg[k]).slice(0, 8);
        return panel(l, list.map((x, i) => `<div class="row between small" style="padding:4px 0;${x.p.tid === S.user ? 'color:var(--gold2)' : ''}"><span class="dim" style="width:16px">${i + 1}</span>${logo(S.teams[x.p.tid], 18)}<span class="grow">${plink(x.p)}</span><span class="num b">${d === 3 ? U.fg(x.pg[k] * 1000, 1000) : x.pg[k].toFixed(1)}</span></div>`).join('') || '<div class="empty small">No qualifiers yet.</div>');
      }).join('')}</div>`;
    } else if (tb.cur === 'races') {
      const reg = S.players.filter(p => p.tid >= 0).map(p => { const t = seasonTotals(p, S.season, 0); return { p, t, pg: perGame(t), team: S.teams[p.tid] }; }).filter(x => x.t.gp >= Math.max(1, tgp * 0.4));
      const race = (title, list, val, fmt) => panel(title, list.slice(0, 6).map((x, i) => `<div class="row between small" style="padding:5px 0;${x.p.tid === S.user ? 'color:var(--gold2)' : ''}"><span class="dim" style="width:16px">${i + 1}</span>${logo(x.team, 18)}<span class="grow">${plink(x.p)} <span class="dim">${x.p.pos}</span></span><span class="num mute">${fmt(x)}</span></div>`).join('') || '<div class="empty small">Too early to tell.</div>');
      const line = x => `${x.pg.ppg.toFixed(1)}/${x.pg.rpg.toFixed(1)}/${x.pg.apg.toFixed(1)}`;
      body = `<div class="grid g3">
        ${race('Most Valuable Player', U.sortBy(reg, x => x.pg.eff * (0.72 + winPct(x.team.rec) * 0.56) + x.pg.ppg * 0.18), null, line)}
        ${race('Rookie of the Year', U.sortBy(reg.filter(x => x.p.yrsPro === 0), x => x.pg.eff + x.pg.ppg * 0.3), null, line)}
        ${race('Defensive Player', U.sortBy(reg, x => x.pg.spg * 2.2 + x.pg.bpg * 2.4 + x.pg.rpg * 0.35 + (x.p.r.pdf + x.p.r.idf) / 40 + winPct(x.team.rec) * 3), null, x => `${x.pg.spg.toFixed(1)} stl · ${x.pg.bpg.toFixed(1)} blk`)}
        ${race('Sixth Man', U.sortBy(reg.filter(x => x.t.gs < x.t.gp * 0.35), x => x.pg.ppg * 0.6 + x.pg.eff * 0.5), null, line)}
      </div><p class="tiny mute">Projected from current stats. Voters weigh team success for MVP.</p>`;
    } else if (tb.cur === 'players') {
      const f = App.ui.statTeam != null ? App.ui.statTeam : -9;
      const rows = all.filter(x => f === -9 || x.p.tid === f || (f === -8 && x.p.tid === S.user));
      body = `<div class="row" style="margin-bottom:10px"><select data-c="statTeam" aria-label="Filter by team"><option value="-9">All teams</option>${S.teams.map(t => `<option value="${t.tid}" ${f === t.tid ? 'selected' : ''}>${E(tname(t))}</option>`).join('')}</select></div>` + panel('Players', sortTable('pstats', [
        { l: 'Player', k: 'n', s: x => x.p.ln, f: x => plink(x.p) }, { l: 'Team', k: 't', s: x => S.teams[x.p.tid].abbr, f: x => S.teams[x.p.tid].abbr }, { l: 'Pos', k: 'pos', s: x => POS_IDX[x.p.pos], f: x => x.p.pos },
        ...[['GP', 'gp', 0], ['MPG', 'mpg', 1], ['PTS', 'ppg', 1], ['REB', 'rpg', 1], ['AST', 'apg', 1], ['STL', 'spg', 1], ['BLK', 'bpg', 1], ['TOV', 'tpg', 1]].map(([l, k, d]) => ({ l, k, n: 1, s: x => x.pg[k], f: x => d ? x.pg[k].toFixed(1) : x.pg[k] })),
        { l: 'FG%', k: 'fgp', n: 1, s: x => x.pg.fgp, f: x => U.fg(x.t.fgm, x.t.fga) }, { l: '3P%', k: 'tpp', n: 1, s: x => x.pg.tpp, f: x => U.fg(x.t.tpm, x.t.tpa) }, { l: 'FT%', k: 'ftp', n: 1, s: x => x.pg.ftp, f: x => U.fg(x.t.ftm, x.t.fta) }, { l: 'EFF', k: 'eff', n: 1, s: x => x.pg.eff, f: x => x.pg.eff.toFixed(1) },
      ], rows, { sort: { k: 'ppg', d: true }, maxh: 640, rowCls: x => x.p.tid === S.user ? 'me' : '' }), { flush: true });
    } else {
      const trows = S.teams.map(t => { const ps = S.players.filter(p => p.stats.some(r => r.s === S.season && r.tid === t.tid && r.po === po)); const tot = sumRows(ps.flatMap(p => p.stats.filter(r => r.s === S.season && r.tid === t.tid && r.po === po))); const g = Math.max(1, po ? (S.playoffs ? S.playoffs.games.filter(x => x.h === t.tid || x.a === t.tid).length : 1) : t.rec.w + t.rec.l); return { t, tot, g }; });
      body = panel('Team Stats (per game)', sortTable('tstats', [
        { l: 'Team', k: 'n', s: x => x.t.abbr, f: x => `<span class="row tight">${logo(x.t, 20)} ${tlink(x.t)}</span>` },
        ...[['PTS', 'pts'], ['REB', x => x.orb + x.drb], ['OREB', 'orb'], ['AST', 'ast'], ['STL', 'stl'], ['BLK', 'blk'], ['TOV', 'tov'], ['3PA', 'tpa'], ['FTA', 'fta']].map(([l, k]) => ({ l, k: l, n: 1, s: x => (typeof k === 'function' ? k(x.tot) : x.tot[k]) / x.g, f: x => ((typeof k === 'function' ? k(x.tot) : x.tot[k]) / x.g).toFixed(1) })),
        { l: 'FG%', k: 'fg', n: 1, s: x => x.tot.fgm / Math.max(1, x.tot.fga), f: x => U.fg(x.tot.fgm, x.tot.fga) }, { l: '3P%', k: 'tp', n: 1, s: x => x.tot.tpm / Math.max(1, x.tot.tpa), f: x => U.fg(x.tot.tpm, x.tot.tpa) },
        { l: 'OPP PTS', k: 'opp', n: 1, s: x => x.t.rec.pa / Math.max(1, x.t.rec.w + x.t.rec.l), f: x => (x.t.rec.pa / Math.max(1, x.t.rec.w + x.t.rec.l)).toFixed(1) },
      ], trows, { sort: { k: 'PTS', d: true }, rowCls: x => x.t.tid === S.user ? 'me' : '' }), { flush: true });
    }
    return `${pageHead('Stats & Leaders', `${U.seasonLabel(S.season)} ${po ? 'playoffs' : 'regular season'}`, S.playoffs ? seg('statpo', [[0, 'Regular season'], [1, 'Playoffs']], po, 'statPO') : '')}${tb.html}${body}`;
  },
};
Act.statTeam = el => { App.ui.statTeam = +el.value; rerender(); };
Act.statPO = el => { App.ui.statPO = +el.dataset.k; rerender(); };

Screens.playoffs = {
  render() {
    const S = App.S, PO = S.playoffs;
    if (!PO) return `${pageHead('Playoffs')}<div class="empty">The playoff bracket is set when the regular season ends.</div>`;
    const card = (sr, r) => {
      if (!sr) return `<div class="panel" style="padding:8px;min-height:62px;opacity:.4"><span class="small mute">TBD</span></div>`;
      const line = (tid, w, win) => `<div class="row between" style="padding:3px 0;${tid === S.user ? 'color:var(--gold2)' : ''}${sr.winner != null && !win ? ';opacity:.45' : ''}"><span class="row tight">${logo(S.teams[tid], 20)}<span class="dim tiny">${seedOf(S, tid)}</span> <b>${S.teams[tid].abbr}</b></span><span class="num b">${w}</span></div>`;
      return `<div class="panel" style="padding:8px 10px">${line(sr.hi, sr.w[0], sr.winner === sr.hi)}${line(sr.lo, sr.w[1], sr.winner === sr.lo)}</div>`;
    };
    const col = (r, conf) => { const rd = PO.rounds[r]; const list = rd ? rd.filter(x => x.conf === conf) : []; const n = [4, 2, 1][r]; const out = []; for (let i = 0; i < n; i++) out.push(card(list[i], r)); return `<div class="stack" style="justify-content:space-around;gap:10px">${out.join('')}</div>`; };
    const fin = PO.rounds[3] ? PO.rounds[3][0] : null;
    const champ = PO.champ != null ? S.teams[PO.champ] : null;
    return `${pageHead('Playoffs', `${U.seasonLabel(S.season)} · ${champ ? 'Champions crowned' : ROUND_NAMES[PO.round]}`)}
      ${champ ? `<div class="panel champ" style="margin-bottom:14px">${logo(champ, 90)}<div class="w">${E(tname(champ))}</div><div class="mute">${U.seasonLabel(S.season)} ${LEAGUE.abbr} Champions</div></div>` : ''}
      <div class="tw"><div style="display:grid;grid-template-columns:repeat(7,minmax(130px,1fr));gap:10px;min-width:960px;align-items:stretch">
        ${col(0, 0)}${col(1, 0)}${col(2, 0)}<div class="stack" style="justify-content:center"><div class="eyebrow c">Finals</div>${card(fin, 3)}</div>${col(2, 1)}${col(1, 1)}${col(0, 1)}
      </div></div>
      <div class="row between tiny mute" style="margin-top:6px"><span>◀ East</span><span>West ▶</span></div>
      ${panel('Recent Playoff Games', sortTable('pog', [{ l: 'Round', f: g => `${ROUND_NAMES[g.round]} G${g.n}` }, { l: 'Matchup', f: g => `${S.teams[g.a].abbr} ${g.as} @ ${S.teams[g.h].abbr} ${g.hs}${g.ot ? ' OT' : ''}` }, { l: '', f: g => S.box[g.gid] ? btn('Box', 'box', 'sm ghost', { gid: g.gid }) : '' }], PO.games.slice().reverse().slice(0, 30)), { flush: true, style: 'margin-top:14px' })}`;
  },
};

Screens.history = {
  render() {
    const S = App.S;
    const tb = tabs('hist', [['champs', 'Champions & Awards'], ['franchise', 'Your Franchise'], ['records', 'Record Book'], ['hof', 'Hall of Fame'], ['leaders', 'Career Leaders']], 'champs');
    let body = '';
    const nm = (pid, n) => pid != null && P(S, pid) ? `<a class="pl" data-a="player" data-id="${pid}">${E(n || pname(P(S, pid)))}</a>` : E(n || '—');
    if (tb.cur === 'champs') {
      body = panel('Season by Season', S.history.length ? sortTable('hc', [{ l: 'Season', f: h => U.seasonLabel(h.s) }, { l: 'Champion', f: h => `<span class="row tight">${logo(S.teams[h.champ], 20)} <b>${E(h.champName)}</b></span>` }, { l: 'Finals', f: h => `${h.series} over ${E(S.teams[h.runner].abbr)}` }, { l: 'Finals MVP', f: h => nm(h.fmvp, h.fmvpN) }, { l: 'MVP', f: h => nm(h.mvp, h.mvpN) }, { l: 'ROY', f: h => nm(h.roy, h.royN) }, { l: 'DPOY', f: h => nm(h.dpoy, h.dpoyN) }, { l: '6MOY', f: h => E(h.smoyN) }, { l: 'MIP', f: h => E(h.mipN) }, { l: 'Coach of the Year', f: h => h.coy ? `${E(h.coy.n)} (${S.teams[h.coy.tid].abbr})` : '' }], S.history.slice().reverse()) : '<div class="empty">History is written at the end of each season.</div>', { flush: true });
    } else if (tb.cur === 'franchise') {
      const t = S.teams[S.user];
      const titles = t.hist.filter(h => h.po === 5).length;
      body = `<div class="grid g4" style="margin-bottom:14px">${[['Seasons', t.hist.length], ['Titles', titles], ['Playoff trips', t.hist.filter(h => h.po > 0).length], ['All-time W-L', `${U.sum(t.hist, h => h.w)}-${U.sum(t.hist, h => h.l)}`]].map(([k, v]) => panel(k, `<div class="big">${v}</div>`)).join('')}</div>` +
        panel('Season Log', t.hist.length ? sortTable('fh', [{ l: 'Season', f: h => U.seasonLabel(h.s) }, { l: 'W-L', f: h => `${h.w}-${h.l}` }, { l: 'Seed', f: h => h.seed > 0 ? h.seed : '—' }, { l: 'Result', f: h => `<span class="${h.po === 5 ? 'gold b' : ''}">${PO_RESULT[h.po]}</span>` }, { l: 'Coach', f: h => E(h.coach) }, { l: 'Profit', n: 1, f: h => { const f = t.finHist.find(x => x.s === h.s); return f ? U.money(f.profit) : '—'; } }, { l: 'Attendance', n: 1, f: h => { const f = t.finHist.find(x => x.s === h.s); return f ? f.att.toLocaleString() : '—'; } }], t.hist.slice().reverse()) : '<div class="empty">Your first season is underway.</div>', { flush: true });
    } else if (tb.cur === 'records') {
      const R = S.records;
      const list = (title, arr, unit) => panel(title, arr.length ? arr.map((r, i) => `<div class="row between small" style="padding:4px 0"><span class="dim" style="width:18px">${i + 1}</span><span class="grow">${nm(r.pid, r.n)} <span class="mute tiny">${S.teams[r.tid] ? S.teams[r.tid].abbr : ''}${r.opp ? ' vs ' + r.opp : ''} · ${U.seasonLabel(r.s)}</span></span><span class="num b">${r.v}${unit || ''}</span></div>`).join('') : '<div class="empty small">—</div>');
      body = `<div class="eyebrow" style="margin-bottom:8px">Single game</div><div class="grid g3">${list('Points', R.game.pts)}${list('Rebounds', R.game.reb)}${list('Assists', R.game.ast)}</div>
        <div class="eyebrow" style="margin:16px 0 8px">Single season (per game)</div><div class="grid g3">${list('Points', R.season.ppg)}${list('Rebounds', R.season.rpg)}${list('Assists', R.season.apg)}</div>
        <div class="eyebrow" style="margin:16px 0 8px">Team</div><div class="grid g3">${panel('Most Wins', R.team.wins.map((r, i) => `<div class="row between small" style="padding:4px 0"><span class="dim" style="width:18px">${i + 1}</span><span class="grow">${E(r.n)} <span class="mute tiny">${U.seasonLabel(r.s)}</span></span><span class="num b">${r.v}-${r.l}</span></div>`).join('') || '<div class="empty small">—</div>')}</div>`;
    } else if (tb.cur === 'hof') {
      const list = S.hof.map(pid => P(S, pid)).filter(Boolean);
      body = panel('Hall of Fame', list.length ? list.map(p => { const c = careerTotals(p); return `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div>${plink(p)} <span class="chip gold">Class of ${p.hof}</span><div class="small mute">${p.pos} · ${p.yrsPro} seasons · ${c.pts.toLocaleString()} pts · ${(c.orb + c.drb).toLocaleString()} reb · ${c.ast.toLocaleString()} ast</div></div><div class="small">${p.awards.filter(a => a.t === 'MVP').length ? p.awards.filter(a => a.t === 'MVP').length + '× MVP · ' : ''}${p.awards.filter(a => a.t === 'CHAMP').length}× Champ · ${p.awards.filter(a => a.t === 'AS').length}× All-Star</div></div>`; }).join('') : '<div class="empty">Players become eligible three seasons after they retire.</div>');
    } else {
      const everyone = S.players.filter(p => p.tid >= -1).concat(S.retired);
      const cat = (l, f) => panel(l, U.sortBy(everyone, p => f(careerTotals(p))).slice(0, 10).map((p, i) => `<div class="row between small" style="padding:4px 0"><span class="dim" style="width:18px">${i + 1}</span><span class="grow">${nm(p.pid)} ${p.tid === -3 ? '<span class="tiny dim">ret.</span>' : ''}</span><span class="num b">${f(careerTotals(p)).toLocaleString()}</span></div>`).join(''));
      body = `<div class="grid g3">${cat('Points', c => c.pts)}${cat('Rebounds', c => c.orb + c.drb)}${cat('Assists', c => c.ast)}${cat('Steals', c => c.stl)}${cat('Blocks', c => c.blk)}${cat('3-Pointers', c => c.tpm)}</div>`;
    }
    return `${pageHead('History & Records', LEAGUE.name)}${tb.html}${body}`;
  },
};

// ---------- All-Star ----------
Screens.allstar = {
  render() {
    const S = App.S, A = S.allStar;
    if (!A) return `${pageHead('All-Star Weekend')}<div class="empty">All-Star Weekend arrives at the midseason break (Day ${S.allStarDay}).</div>`;
    const plist = (ids, starters) => ids.map(id => { const p = P(S, id); const pg = perGame(seasonTotals(p, S.season)); return `<div class="row between small" style="padding:4px 0;${p.tid === S.user ? 'color:var(--gold2)' : ''}">${logo(S.teams[p.tid], 18)}<span class="grow">${plink(p)} <span class="dim">${p.pos}</span>${starters && starters.includes(id) ? ' <span class="chip gold">Starter</span>' : ''}</span><span class="num mute">${pg.ppg.toFixed(1)}/${pg.rpg.toFixed(1)}/${pg.apg.toFixed(1)}</span></div>`; }).join('');
    const userIn3 = A.three.find(id => P(S, id).tid === S.user);
    const three = A.res.three ? `<div class="tw"><table class="t"><thead><tr><th>Shooter</th><th class="n">Round 1</th><th class="n">Final</th></tr></thead><tbody>${A.res.three.r1.slice().sort((a, b) => b.tot - a.tot).map(x => { const f = A.res.three.r2.find(y => y.pid === x.pid); return `<tr class="${x.pid === A.res.three.winner ? 'me' : ''}"><td>${plink(P(S, x.pid))}${x.pid === A.res.three.winner ? ' 🏆' : ''}</td><td class="n">${x.tot}</td><td class="n">${f ? f.tot : '—'}</td></tr>`; }).join('')}</tbody></table></div>`
      : `${plist(A.three)}<div class="row" style="margin-top:10px">${userIn3 ? btn(`Shoot for ${pshort(P(S, userIn3))}`, 'play3', 'gold', { id: userIn3 }) : ''}${btn('Sim Shootout', 'sim3', userIn3 ? '' : 'gold')}</div>`;
    const dunk = A.res.dunk ? A.res.dunk.r2.map(x => `<div style="padding:4px 0">${plink(P(S, x.pid))}${x.pid === A.res.dunk.winner ? ' 🏆' : ''} <span class="num b">${x.tot}</span><div class="tiny mute">${x.d.map(d => `${E(d.dunk)} (${d.s})`).join(' · ')}</div></div>`).join('') + `<div class="tiny mute" style="margin-top:6px">Round 1: ${A.res.dunk.r1.map(x => `${pshort(P(S, x.pid))} ${x.tot}`).join(', ')}</div>`
      : `${plist(A.dunk)}<div style="margin-top:10px">${btn('Sim Dunk Contest', 'simDunk', 'gold')}</div>`;
    const game = A.res.game ? `<div class="c"><div style="font:700 36px/1 var(--f-num)">EAST ${A.res.game.score[0]} – ${A.res.game.score[1]} WEST</div><p>MVP: ${plink(P(S, A.res.game.mvp))}</p>${btn('Box Score', 'asBox', 'sm ghost')}</div>` : `<div class="row" style="justify-content:center">${btn('Watch All-Star Game', 'asWatch', 'gold')}${btn('Sim Game', 'asSim', '')}</div>`;
    return `${pageHead('All-Star Weekend', `${U.seasonLabel(S.season)} midseason classic`, A.finished ? btn('Back to the Season', 'go', 'gold', { r: 'home' }) : btn('Sim Everything', 'asAll', ''))}
      <div class="grid g2">${panel('East All-Stars', plist(A.sel[0], A.starters[0]))}${panel('West All-Stars', plist(A.sel[1], A.starters[1]))}</div>
      <div class="grid g3" style="margin-top:14px">${panel('Three-Point Shootout', three)}${panel('Slam Dunk Contest', dunk)}${panel('All-Star Game', game)}</div>`;
  },
};
Act.sim3 = () => { threeContest(App.S); autosave(); rerender(); };
Act.simDunk = () => { dunkContest(App.S); autosave(); rerender(); };
const clearASGame = () => { if (App.game && App.game.o.allstar) App.game = null; };
Act.asSim = () => { clearASGame(); const sim = allStarGame(App.S); sim.simToEnd(); allStarFinish(App.S, sim); autosave(); rerender(); };
Act.asAll = () => { clearASGame(); allStarAuto(App.S); autosave(); rerender(); };
Act.asWatch = () => { const sim = allStarGame(App.S); App.game = null; go('game', { allstar: 1 }); startGameView(sim, { allstar: true, watch: true }); };
Act.asBox = () => { const b = App.S.allStar.res.game.box; App.S.box[-1] = Object.assign({}, b, { teams: b.teams.map((t, i) => Object.assign({}, t, { tid: -1 })) }); openAllStarBox(b); };
function openAllStarBox(b) {
  const S = App.S;
  const mk = i => ({ abbr: i === 0 ? 'EAST' : 'WEST', tid: i === 0 ? 0 : 3, c1: i === 0 ? '#1f4e8c' : '#8c1f2f', c2: '#ffffff', region: i === 0 ? 'East' : 'West', name: 'All-Stars' });
  modal('All-Star Game', `<div class="c big" style="margin-bottom:10px">EAST ${b.score[0]} – ${b.score[1]} WEST</div>${[0, 1].map(i => `<div class="eyebrow" style="margin:12px 0 6px">${mk(i).abbr}</div>${boxTable(S, b.teams[i], b)}`).join('')}`, '', {});
}
Act.play3 = el => {
  const S = App.S, pid = +el.dataset.id, p = P(S, pid);
  MiniGames.shoot(p, (grade, detail) => {
    const r1 = { pid, racks: detail.racks, tot: detail.tot };
    const others = S.allStar.three.filter(id => id !== pid).map(id => threeRound(P(S, id)));
    const all = others.concat([r1]).sort((a, b) => b.tot - a.tot);
    const inFinal = all.slice(0, 3).some(x => x.pid === pid);
    const done = (r2u) => {
      threeContest(S, { r1: Object.fromEntries(all.map(x => [x.pid, x])), r2: r2u ? { [pid]: r2u } : {} });
      autosave(); rerender();
      const w = S.allStar.res.three.winner;
      toast(w === pid ? `${pname(p)} wins the Shootout!` : `${pname(P(S, w))} wins the Shootout.`, w === pid ? 'good' : '');
    };
    if (!inFinal) { modal('Shootout', `<p>${E(pname(p))} scored ${r1.tot} and missed the final round (cutoff: ${all[2].tot}).</p>`, btn('Continue', 'closeModal', 'gold'), { size: 'sm', onClose: () => done(null) }); return; }
    modal('Final Round!', `<p>${E(pname(p))} scored ${r1.tot} and made the final three. Shoot again for the title.</p>`, btn('Shoot the Final', 'closeModal', 'gold'), { size: 'sm', onClose: () => setTimeout(() => MiniGames.shoot(p, (g2, d2) => done({ pid, racks: d2.racks, tot: d2.tot }), { contest: true }), 50) });
  }, { contest: true });
};

// ---------- season review & progression ----------
Screens.review = {
  render() {
    const S = App.S;
    const h = S.history.filter(x => x.s === S.season)[0] || S.history[S.history.length - 1];
    if (!h) return `${pageHead('Season Review')}<div class="empty">No completed season yet.</div>`;
    const A = S.seasonAwards || {};
    const t = S.teams[S.user];
    const champ = S.teams[h.champ];
    const fh = t.finHist.find(f => f.s === h.s);
    const aw = (l, pid) => pid != null && P(S, pid) ? `<div class="row between small" style="padding:5px 0;border-bottom:1px solid var(--line)"><span class="mute">${l}</span><span>${plink(P(S, pid))} <span class="dim">${P(S, pid).tid >= 0 ? S.teams[P(S, pid).tid].abbr : ''}</span></span></div>` : '';
    const teamList = (ids) => ids.map(id => plink(P(S, id), true)).join(', ');
    return `${pageHead('Season Review', U.seasonLabel(h.s), S.phase === PH.END ? btn('Begin Offseason', 'advOffseason', 'gold') : '')}
      <div class="panel champ" style="margin-bottom:14px">${logo(champ, 96)}<div class="w">${E(h.champName)}</div><div class="mute">beat the ${E(S.teams[h.runner].name)} ${h.series} · Finals MVP ${E(h.fmvpN)}</div></div>
      <div class="grid g3">
        ${panel('Your Season', `<div class="big">${h.user.w}-${h.user.l}</div><p class="${h.user.po === 5 ? 'gold b' : 'mute'}">${PO_RESULT[h.user.po]}</p>${fh ? `<div class="kv small"><span>Revenue</span><span>${U.money(ledgerTotal(fh.rev))}</span><span>Expenses</span><span>${U.money(ledgerTotal(fh.exp))}</span><span>Profit</span><span class="${fh.profit >= 0 ? 'good' : 'bad'}">${U.money(fh.profit)}</span><span>Avg. attendance</span><span>${fh.att.toLocaleString()}</span><span>Fan happiness</span><span>${fh.fan}</span></div>` : ''}`)}
        ${panel('Major Awards', aw('Most Valuable Player', A.mvp) + aw('Defensive Player', A.dpoy) + aw('Rookie of the Year', A.roy) + aw('Sixth Man', A.smoy) + aw('Most Improved', A.mip) + (A.coy ? `<div class="row between small" style="padding:5px 0"><span class="mute">Coach of the Year</span><span>${E(A.coy.n)} <span class="dim">${S.teams[A.coy.tid].abbr}</span></span></div>` : ''))}
        ${panel('Stat Champions', aw('Points', A.lead && A.lead.pts) + aw('Rebounds', A.lead && A.lead.reb) + aw('Assists', A.lead && A.lead.ast) + aw('Steals', A.lead && A.lead.stl) + aw('Blocks', A.lead && A.lead.blk))}
      </div>
      ${A.all ? `<div class="grid g3" style="margin-top:14px">${A.all.map((tm, i) => panel(`All-League ${U.ord(i + 1)} Team`, `<div class="small">${teamList(tm)}</div>`)).join('')}</div>
      <div class="grid g3" style="margin-top:14px">${A.alld.map((tm, i) => panel(`All-Defense ${U.ord(i + 1)} Team`, `<div class="small">${teamList(tm)}</div>`)).join('')}${panel('All-Rookie Team', `<div class="small">${teamList(A.allr)}</div>`)}</div>` : ''}`;
  },
};
Screens.progress = {
  render() {
    const S = App.S;
    const rep = S.progReport || [];
    return `${pageHead('Progression Report', 'How your players developed over the offseason', btn('Draft Lottery ▸', 'goLottery', 'gold'))}
      ${panel('Your Roster', sortTable('prog', [{ l: 'Player', f: r => `<a class="pl" data-a="player" data-id="${r.pid}">${E(r.n)}</a>` }, { l: 'Pos', f: r => r.pos }, { l: 'Age', n: 1, f: r => r.age + 1 }, { l: 'Before', c: 1, f: r => rt(r.before) }, { l: 'After', c: 1, f: r => rt(r.after) },
      { l: 'Change', n: 1, k: 'd', s: r => r.after - r.before, f: r => { const d = r.after - r.before; return `<span class="b ${d > 0 ? 'good' : d < 0 ? 'bad' : 'mute'}">${d > 0 ? '+' : ''}${d}</span>`; } }], rep), { flush: true })}
      <p class="tiny mute">Development depends on age, potential, minutes played, your coaching staff and practice facility.</p>
      ${panel('Retirements Around the League', S.news.filter(n => n.type === 'retire' && n.s === S.season).map(newsItem).join('') || '<div class="empty small">No notable retirements.</div>', { style: 'margin-top:14px' })}`;
  },
};

// ===== ui/screens_fo.js — trades, free agency, re-signing, draft, lottery =====
Screens.trade = {
  render() {
    const S = App.S;
    if (!App.trade) App.trade = { tid: S.teams.find(t => t.tid !== S.user).tid, give: { pids: [], picks: [] }, get: { pids: [], picks: [] } };
    const T = App.trade, other = S.teams[T.tid];
    const own = (sel, tid) => { sel.pids = sel.pids.filter(id => { const p = P(S, id); return p && p.tid === tid; }); sel.picks = sel.picks.filter(id => { const k = S.picks.find(x => x.id === id); return k && k.tid === tid; }); };
    own(T.give, S.user); own(T.get, T.tid);
    const closed = (S.phase === PH.REG && S.day > S.deadlineDay) || S.phase === PH.PO;
    const side = (tid, sel, key) => {
      const ps = U.sortBy(roster(S, tid), p => p.ovr);
      const picks = S.picks.filter(k => k.tid === tid).sort((a, b) => a.year - b.year || a.rd - b.rd);
      return `<div class="tw" style="max-height:440px;overflow-y:auto"><table class="t"><tbody>${ps.map(p => `<tr class="${sel.pids.includes(p.pid) ? 'me' : ''}"><td style="width:30px"><input type="checkbox" ${sel.pids.includes(p.pid) ? 'checked' : ''} data-c="trSel" data-s="${key}" data-id="${p.pid}" aria-label="Select ${E(pname(p))}"></td><td>${plink(p)} ${injChip(p)}${S.tradeBlock.includes(p.pid) && tid === S.user ? '<span class="chip warn">TB</span>' : ''}<div class="tiny mute">${p.pos} · ${p.age} yrs · ${U.money(p.contract.amt)} thru ${U.seasonLabel(p.contract.exp)}</div></td><td class="c">${rt(p.ovr)}</td><td class="c">${potStr(S, p)}</td></tr>`).join('')}
        ${picks.map(k => `<tr class="${sel.picks.includes(k.id) ? 'me' : ''}"><td><input type="checkbox" ${sel.picks.includes(k.id) ? 'checked' : ''} data-c="trSel" data-s="${key}" data-pk="${k.id}" aria-label="Select pick"></td><td colspan="3"><b>${E(pickLabel(S, k))}</b> <span class="tiny mute">draft pick${k.rd === 1 ? ` · proj. #${projectedPick(S, k.orig)}` : ''}</span></td></tr>`).join('')}</tbody></table></div>`;
    };
    const sal = pids => U.sum(pids, id => P(S, id).contract.amt);
    const probs = (T.give.pids.length + T.give.picks.length + T.get.pids.length + T.get.picks.length) ? tradeProblems(S, S.user, T.tid, T.give, T.get) : [];
    let meter = '';
    if (T.get.pids.length + T.get.picks.length + T.give.pids.length + T.give.picks.length) {
      const v = aiTradeVerdict(S, T.tid, T.get, T.give, DIFFS[S.diff].trade);
      const r = v.get / Math.max(1, v.need);
      const lbl = r >= 1 ? ['good', 'They would take this deal'] : r >= 0.9 ? ['warn', 'Close — they want a little more'] : r >= 0.7 ? ['warn', 'Not enough value for them'] : ['bad', 'Not interested'];
      meter = `<div class="row"><span class="chip ${lbl[0]}">${lbl[1]}</span><div class="bar" style="flex:1;min-width:120px"><i style="width:${U.clamp(r * 100, 3, 100)}%;background:var(--${lbl[0] === 'good' ? 'good' : lbl[0] === 'warn' ? 'warn' : 'bad'})"></i></div></div>`;
    }
    const offers = S.offers.filter(o => o.s === S.season || true);
    const offerList = offers.map(o => { const t = S.teams[o.tid]; return `<div class="row between" style="padding:8px 0;border-bottom:1px solid var(--line)"><div class="small">${logo(t, 20)} <b>${t.abbr}</b> offer ${o.get.pids.map(id => pname(P(S, id))).concat(o.get.picks.map(id => { const k = S.picks.find(x => x.id === id); return k ? pickLabel(S, k) : '?'; })).join(', ')} <span class="mute">for</span> ${o.pids.map(id => pname(P(S, id))).join(', ')}</div><div class="row tight">${btn('Accept', 'offerAccept', 'gold sm', { id: o.id })}${btn('Counter', 'counterOffer', 'sm', { id: o.id })}${btn('Decline', 'offerDecline', 'sm ghost', { id: o.id })}</div></div>`; }).join('');
    return `${pageHead('Trade Center', closed ? '<span class="bad">Trading is closed until the offseason.</span>' : `Deadline: ${S.phase === PH.REG ? 'after Day ' + S.deadlineDay : 'open'} · Cap room ${U.money(capSpace(S, S.user))}`)}
      <div class="row" style="margin-bottom:12px"><label class="fld" style="flex-direction:row;align-items:center;gap:8px">Trade partner <select data-c="trTeam" aria-label="Trade partner">${S.teams.filter(t => t.tid !== S.user).map(t => `<option value="${t.tid}" ${t.tid === T.tid ? 'selected' : ''}>${E(tname(t))} (${rec(t)})</option>`).join('')}</select></label><span class="chip">${teamMode(S, T.tid) === 'contend' ? 'Contending — wants proven players' : teamMode(S, T.tid) === 'rebuild' ? 'Rebuilding — wants youth and picks' : 'Middle of the pack'}</span>${btn('Clear', 'trClear', 'sm ghost')}</div>
      <div class="grid g2">
        ${panel(`You give · ${U.money(sal(T.give.pids))}`, side(S.user, T.give, 'give'), { flush: true })}
        ${panel(`<span class="row tight" style="display:inline-flex">${logo(other, 22)} You get · ${U.money(sal(T.get.pids))}</span>`, side(T.tid, T.get, 'get'), { flush: true })}
      </div>
      <div class="panel" style="margin-top:14px;padding:12px"><div class="stack">${meter}${probs.map(p => `<div class="small bad">⚠ ${E(p)}</div>`).join('')}
        <div class="row">${btn('Propose Trade', 'trPropose', 'gold', {})}${btn('What would they give?', 'trAsk', '')}<span class="small mute">Pick players you'd move and the AI GM builds a counter.</span></div></div></div>
      <div class="grid g2" style="margin-top:14px">
        ${panel('Your Trading Block', S.tradeBlock.length ? S.tradeBlock.map(id => { const p = P(S, id); return p ? `<div class="row between small" style="padding:5px 0">${plink(p)} ${rt(p.ovr)} ${btn('Remove', 'toggleBlock', 'sm ghost', { id })}</div>` : ''; }).join('') : '<div class="empty small">Put players on the block from their player card. Offers arrive weekly in your inbox.</div>')}
        ${panel('Incoming Offers', offerList || '<div class="empty small">No offers on the table.</div>')}
      </div>`;
  },
};
Act.trTeam = el => { App.trade = { tid: +el.value, give: App.trade.give, get: { pids: [], picks: [] } }; rerender(); };
Act.trClear = () => { App.trade.give = { pids: [], picks: [] }; App.trade.get = { pids: [], picks: [] }; rerender(); };
Act.trSel = el => {
  const sel = App.trade[el.dataset.s];
  if (el.dataset.id) { const id = +el.dataset.id; sel.pids = el.checked ? sel.pids.concat([id]) : sel.pids.filter(x => x !== id); }
  else { const id = +el.dataset.pk; sel.picks = el.checked ? sel.picks.concat([id]) : sel.picks.filter(x => x !== id); }
  rerender();
};
Act.trPropose = () => {
  const S = App.S, T = App.trade;
  if (!(T.give.pids.length + T.give.picks.length) || !(T.get.pids.length + T.get.picks.length)) { toast('Select assets on both sides.', 'bad'); return; }
  const r = proposeTrade(S, T.tid, T.give, T.get);
  if (r.ok) { toast('Trade accepted!', 'good'); App.trade = { tid: T.tid, give: { pids: [], picks: [] }, get: { pids: [], picks: [] } }; autosave(); }
  else toast(r.msg, 'bad');
  rerender();
};
Act.trAsk = () => {
  const S = App.S, T = App.trade;
  if (!(T.give.pids.length + T.give.picks.length)) { toast('Select players or picks you would give up.', 'bad'); return; }
  const val = assetsValue(S, S.user, T.give.pids, T.give.picks, T.tid);
  const out = U.sum(T.give.pids, id => P(S, id).contract.amt);
  const userMax = teamPay(S, S.user) - out <= S.cap ? Math.max(out * 1.25 + 100, S.cap - (teamPay(S, S.user) - out)) : out * 1.25 + 100;
  const { pkg } = buildPackage(S, T.tid, (val - 1) / DIFFS[S.diff].trade * 0.96, [], userMax);
  matchSalary(S, T.tid, pkg, out);
  if (tradeProblems(S, S.user, T.tid, T.give, pkg).length || !aiTradeVerdict(S, T.tid, pkg, T.give, DIFFS[S.diff].trade).ok) { toast(`${S.teams[T.tid].abbr} can't find a deal that works for both sides.`); return; }
  if (!pkg.pids.length && !pkg.picks.length) { toast(`${S.teams[T.tid].abbr} don't have a fit for that.`); return; }
  T.get = pkg; rerender();
  toast(`${S.teams[T.tid].abbr} put together an offer. Review it and propose.`);
};
Act.offerAccept = el => { const S = App.S; const o = S.offers.find(x => x.id === +el.dataset.id); if (!o) return; const r = acceptOffer(S, o); if (r) toast(r, 'bad'); else { toast('Trade complete!', 'good'); autosave(); } rerender(); };
Act.offerDecline = el => { App.S.offers = App.S.offers.filter(x => x.id !== +el.dataset.id); rerender(); };

// ---------- free agency ----------
Screens.fa = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const live = S.phase === PH.FA && S.fa;
    const fas = S.players.filter(p => p.tid === -1);
    for (const p of fas) if (!p.ask) { const a = contractAsk(S, p, -1); p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt }; }
    const myOffer = p => p.fa && p.fa.offers.find(o => o.tid === S.user);
    const cols = [
      { l: 'Player', k: 'n', s: p => p.ln, f: p => `${plink(p)} ${injChip(p)}${p.prevTid === S.user ? '<span class="chip">Yours</span>' : ''}` }, { l: 'Pos', k: 'pos', s: p => POS_IDX[p.pos], f: p => p.pos }, { l: 'Age', k: 'age', n: 1, f: p => p.age },
      { l: 'OVR', k: 'ovr', c: 1, f: p => rt(p.ovr) }, { l: 'POT', k: 'pot', c: 1, s: p => Math.max(p.pot, p.ovr), f: p => potStr(S, p) },
      { l: 'Asking', k: 'ask', n: 1, s: p => p.ask.amt, f: p => `${U.money(p.ask.amt)} × ${p.ask.yrs}` },
      { l: 'Type', k: 'pers', s: p => p.pers, f: p => `<span class="small mute">${PERSONALITIES[p.pers].n}</span>` },
    ];
    if (live) cols.push({ l: 'Bids', k: 'bids', n: 1, s: p => p.fa ? p.fa.offers.length : 0, f: p => p.fa ? p.fa.offers.length : 0 });
    cols.push({ l: 'Your offer', k: 'mine', s: p => myOffer(p) ? myOffer(p).amt : 0, f: p => { const o = myOffer(p); return o ? `<span class="gold">${U.money(o.amt)} × ${o.yrs}</span> <span class="tiny">${interestLabel(faScore(S, p, S.user, o.amt, o.yrs))}</span>` : ''; } });
    cols.push({ l: '', f: p => btn(live ? (myOffer(p) ? 'Revise' : 'Offer') : 'Sign', 'faOfferOpen', 'sm ' + (myOffer(p) ? '' : 'gold'), { id: p.pid }) });
    const pending = fas.filter(p => myOffer(p));
    return `${pageHead('Free Agents', live ? `Free agency day ${Math.min(S.fa.day, S.fa.days)} of ${S.fa.days}. Offers are binding until the player decides.` : 'Unsigned players. In-season signings are decided on the spot.', (live ? btn(advanceInfo(S).label, 'faNext', 'gold') : '') + btn('Create a Player', 'capOpen', 'ghost'))}
      <div class="grid g4" style="margin-bottom:14px">
        ${panel('Cap Room', `<div class="big ${capSpace(S, S.user) < 0 ? 'bad' : 'good'}">${U.money(capSpace(S, S.user))}</div><div class="tiny mute">${offseason(S) ? 'Next season' : 'This season'} · cap ${U.money(S.cap)}</div>`)}
        ${panel('Roster', `<div class="big">${rosterCount(S, S.user)}<span class="mute" style="font-size:16px"> / ${rosterMax(S)}</span></div><div class="tiny mute">${offseason(S) ? 'under contract next season' : 'players'}</div>`)}
        ${panel('Mid-Level', `<div class="big">${t.mle ? '<span class="mute">Used</span>' : U.money(S.mle)}</div><div class="tiny mute">once per season when over the cap</div>`)}
        ${panel('Pending Offers', `<div class="big">${pending.length}</div><div class="tiny mute">${pending.length ? U.money(U.sum(pending, p => myOffer(p).amt)) + ' committed' : 'none'}</div>`)}
      </div>
      ${panel('Market', sortTable('fa', cols, fas, { sort: { k: 'ovr', d: true }, maxh: 700, empty: 'No free agents available.' }), { flush: true })}`;
  },
};
Act.faOfferOpen = el => {
  const S = App.S, p = P(S, +el.dataset.id);
  if (!p.ask) { const a = contractAsk(S, p, -1); p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt }; }
  const mine = p.fa && p.fa.offers.find(o => o.tid === S.user);
  App.fo = { pid: p.pid, amt: mine ? mine.amt : p.ask.amt, yrs: mine ? mine.yrs : p.ask.yrs };
  faOfferModal();
};
function faOfferModal(msg) {
  const S = App.S, F = App.fo, p = P(S, F.pid);
  const live = S.phase === PH.FA && S.fa;
  const v = faScore(S, p, S.user, F.amt, F.yrs);
  const block = signBlock(S, S.user, F.amt);
  const body = `<div class="row" style="margin-bottom:10px">${rt(p.ovr)}<div><div class="b">${E(pname(p))} · ${p.pos} · ${p.age}</div><div class="small mute">${PERSONALITIES[p.pers].n}: ${PERSONALITIES[p.pers].d}</div></div></div>
    <div class="kv small"><span>Asking</span><span class="gold">${U.money(p.ask.amt)} × ${p.ask.yrs} yrs</span><span>Your cap room</span><span>${U.money(capSpace(S, S.user))}</span>${live ? `<span>Competing bids</span><span>${p.fa ? p.fa.offers.filter(o => o.tid !== S.user).length : 0}</span>` : ''}</div>
    <hr class="sep"><label class="fld">Salary per season: <b class="num" id="foAmtL">${U.money(F.amt)}</b><input type="range" min="${S.minSal}" max="${S.maxSal}" step="50" value="${F.amt}" data-i="foAmt"></label>
    <div class="fld" style="margin-top:10px">Years ${seg('foYrs', [1, 2, 3, 4, 5].map(y => [y, y]), F.yrs, 'foYrs')}</div>
    <p style="margin-top:12px">His interest: <b id="foInt" class="${v >= 1 ? 'good' : v >= 0.9 ? 'warn' : 'bad'}">${interestLabel(v)}</b></p>
    ${block ? `<p class="small bad">${E(block)}</p>` : ''}${msg ? `<p class="${msg.ok ? 'good' : 'warn'}">${E(msg.msg)}</p>` : ''}`;
  const foot = msg && msg.ok ? btn('Done', 'closeModal', 'gold') : `${live && p.fa && p.fa.offers.some(o => o.tid === S.user) ? btn('Withdraw', 'foWithdraw', 'red') : ''}${btn('Cancel', 'closeModal', 'ghost')}${btn(live ? 'Submit Offer' : 'Sign Now', 'foSubmit', 'gold')}`;
  modal(live ? 'Free Agent Offer' : 'Sign Free Agent', body, foot, { size: 'sm' });
}
Act.foAmt = el => { const S = App.S, F = App.fo; F.amt = +el.value; const l = $('#foAmtL'); if (l) l.textContent = U.money(F.amt); const v = faScore(S, P(S, F.pid), S.user, F.amt, F.yrs); const i = $('#foInt'); if (i) { i.textContent = interestLabel(v); i.className = v >= 1 ? 'good' : v >= 0.9 ? 'warn' : 'bad'; } };
Act.foYrs = el => { App.fo.yrs = +el.dataset.k; faOfferModal(); };
Act.foWithdraw = () => { const S = App.S, p = P(S, App.fo.pid); if (p.fa) p.fa.offers = p.fa.offers.filter(o => o.tid !== S.user); closeModal(); rerender(); };
Act.foSubmit = () => {
  const S = App.S, F = App.fo, p = P(S, F.pid);
  if (S.phase === PH.FA && S.fa) {
    const err = userOffer(S, p, F.amt, F.yrs);
    if (err) { faOfferModal({ ok: false, msg: err }); return; }
    closeModal(); toast(`Offer submitted to ${pname(p)}. He'll decide over the coming days.`); autosave(); rerender();
  } else {
    const r = signNow(S, p, F.amt, F.yrs);
    faOfferModal(r);
    if (r.ok) { autosave(); setTimeout(rerender, 10); }
  }
};

// ---------- re-sign ----------
Screens.resign = {
  render() {
    const S = App.S;
    const exp = roster(S, S.user).filter(p => p.contract.exp <= S.season);
    const committed = payrollNext(S, S.user);
    const asks = U.sum(exp.filter(p => resignStatus(S, p) !== 'refuses'), p => contractAsk(S, p, p.tid).amt);
    const cols = [{ l: 'Player', k: 'n', s: p => p.ln, f: p => plink(p) }, { l: 'Pos', k: 'pos', f: p => p.pos }, { l: 'Age', k: 'age', n: 1, f: p => p.age }, { l: 'OVR', k: 'ovr', c: 1, f: p => rt(p.ovr) }, { l: 'POT', k: 'pot', c: 1, s: p => p.pot, f: p => potStr(S, p) },
    { l: 'Current', k: 'cur', n: 1, s: p => p.contract.amt, f: p => U.money(p.contract.amt) }, { l: 'Asking', k: 'ask', n: 1, s: p => contractAsk(S, p, p.tid).amt, f: p => { const a = contractAsk(S, p, p.tid); return `${U.money(a.amt)} × ${a.yrs}`; } },
    { l: 'Mood', k: 'm', s: p => p.morale, f: p => moodIcon(p.morale) }, { l: 'Status', k: 'st', s: p => resignStatus(S, p), f: p => { const s = resignStatus(S, p); return s === 'willing' ? '<span class="chip good">Willing</span>' : s === 'testing' ? '<span class="chip warn">Testing market</span>' : '<span class="chip bad">Won\'t re-sign</span>'; } },
    { l: '', f: p => resignStatus(S, p) === 'refuses' ? '' : btn('Negotiate', 'negotiateOpen', 'gold sm', { id: p.pid }) }];
    return `${pageHead('Re-sign Players', `Committed next season: ${U.money(committed)} · Cap ${U.money(S.cap)} · Tax ${U.money(S.tax)} · Total asks ${U.money(asks)}`, btn('Open Free Agency ▸', 'advFA', 'gold'))}
      ${panel('Expiring Contracts', sortTable('rs', cols, exp, { sort: { k: 'ovr', d: true }, empty: 'No expiring contracts. Head to free agency.' }), { flush: true })}
      <p class="tiny mute">You can always exceed the cap to keep your own players. Three lowball offers and he walks. Players you don't re-sign become free agents — you can still bid on them against the field.</p>`;
  },
};

// ---------- draft ----------
Screens.draft = {
  render() {
    const S = App.S;
    const D = S.draft;
    const live = S.phase === PH.DRAFT && D;
    const year = live ? D.year : S.season + 1;
    const pool = prospects(S, year);
    const board = pool.map(p => ({ p, pr: perceived(S, p) })).sort((a, b) => (b.pr.ovr * 0.42 + b.pr.pot * 0.58) - (a.pr.ovr * 0.42 + a.pr.pot * 0.58));
    const onClock = live && !D.done ? D.picks[D.cur] : null;
    const myTurn = onClock && onClock.tid === S.user;
    const cols = [
      { l: 'Rk', f: x => board.indexOf(x) + 1 },
      { l: 'Prospect', k: 'n', s: x => x.p.ln, f: x => `${plink(x.p)} <span class="tiny mute">${E(x.p.college)}</span>` }, { l: 'Pos', k: 'pos', s: x => POS_IDX[x.p.pos], f: x => x.p.pos }, { l: 'Age', k: 'age', n: 1, s: x => x.p.age, f: x => x.p.age },
      { l: 'Ht', k: 'hgt', n: 1, s: x => x.p.hgt, f: x => U.hgt(x.p.hgt) },
      { l: 'OVR', k: 'ovr', c: 1, s: x => x.pr.ovr, f: x => (x.p.slvl || 0) >= 2 ? rt(x.p.ovr) : `<span class="mute num" title="Scouting estimate">${x.pr.ovr - ((x.p.slvl || 0) ? 2 : 5)}–${x.pr.ovr + ((x.p.slvl || 0) ? 2 : 5)}</span>` },
      { l: 'POT', k: 'pot', c: 1, s: x => x.pr.pot, f: x => gradeChip(potGrade(x.pr.pot)) + ((x.p.slvl || 0) < 2 ? '<span class="dim tiny">?</span>' : '') },
      { l: 'Scouting', f: x => { const l = x.p.slvl || 0; return l >= 2 ? '<span class="chip good">Workout</span>' : l === 1 ? `<span class="chip">Scouted</span> ${btn('Workout 12', 'scout', 'sm ghost', { id: x.p.pid, l: 2 })}` : `${btn('Scout 8', 'scout', 'sm ghost', { id: x.p.pid, l: 1 })}${btn('Workout 20', 'scout', 'sm ghost', { id: x.p.pid, l: 2 })}`; } },
    ];
    if (myTurn) cols.push({ l: '', f: x => btn('Draft', 'draftPick', 'gold sm', { id: x.p.pid }) });
    let room = '';
    if (live) {
      const made = D.picks.slice(0, D.cur).reverse().slice(0, 60);
      room = `<div class="grid g-main" style="margin-bottom:14px">
        ${panel(D.done ? 'Draft Complete' : (myTurn ? '<span class="gold">You\'re on the clock!</span>' : 'On the Clock'), D.done ? `<p>All picks are in. ${btn('Re-sign Players ▸', 'advResign', 'gold')}</p>` : `<div class="row">${logo(S.teams[onClock.tid], 56)}<div><div class="eyebrow">Round ${onClock.rd} · Pick ${onClock.pick}</div><div style="font:800 26px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(tname(S.teams[onClock.tid]))}</div>${onClock.orig !== onClock.tid ? `<div class="tiny mute">via ${S.teams[onClock.orig].abbr}</div>` : ''}</div></div>
          <hr class="sep"><div class="row">${myTurn ? btn('Auto-pick for me', 'draftAuto', '') : btn('Sim to my pick', 'draftSim', 'gold', { mode: 'mine' })}${btn('Next pick', 'draftSim', '', { mode: 'one' })}${btn('Sim rest of draft', 'draftSim', 'ghost', { mode: 'all' })}</div>
          <div class="small mute" style="margin-top:8px">Your picks: ${D.picks.filter(k => k.tid === S.user).map(k => k.pid ? `#${k.pick} ${E(pname(P(S, k.pid)))}` : `#${k.pick}`).join(' · ') || 'none'}</div>`)}
        ${panel('Draft Log', `<div style="max-height:220px;overflow-y:auto">${made.map(k => `<div class="row small" style="padding:3px 0;${k.tid === S.user ? 'color:var(--gold2)' : ''}"><span class="num dim" style="width:26px">${k.pick}</span>${logo(S.teams[k.tid], 18)}<b>${S.teams[k.tid].abbr}</b> ${k.pid ? plink(P(S, k.pid)) + ` <span class="dim">${P(S, k.pid).pos}</span>` : '—'}</div>`).join('') || '<div class="empty small">No picks yet.</div>'}</div>`)}
      </div>`;
    }
    const myPicks = S.picks.filter(k => k.tid === S.user && k.year === year).map(k => `${k.rd === 1 ? '1st' : '2nd'} (${S.teams[k.orig].abbr}${k.rd === 1 && !live ? ', proj. #' + projectedPick(S, k.orig) : ''})`);
    return `${pageHead(live ? `${year} Draft Room` : 'Draft & Scouting', `${year} class · ${pool.length} prospects · Scouting points: <b class="gold">${S.scout.pts}</b> / ${S.scout.max}${myPicks.length ? ' · Your picks: ' + myPicks.join(', ') : ''}`)}
      ${room}
      ${panel('Big Board', sortTable('board', cols, board, { maxh: 720 }), { flush: true })}
      <p class="tiny mute">Unscouted ratings are educated guesses with wide error bars — your head scout's eye matters. A workout reveals true ratings and potential. Points refresh every season.</p>`;
  },
};
Act.scout = el => { const S = App.S; const err = scoutProspect(S, P(S, +el.dataset.id), +el.dataset.l); if (err) toast(err, 'bad'); autosave(); rerender(); };
Act.draftPick = el => { const S = App.S; const p = makeDraftPick(S, +el.dataset.id); toast(`You selected ${pname(p)}!`, 'good'); autosave(); rerender(); };
Act.draftAuto = () => { const S = App.S; const p = aiPick(S); if (p) toast(`Staff selected ${pname(p)}.`); autosave(); rerender(); };
Act.draftSim = async el => {
  const S = App.S, D = S.draft, mode = el.dataset.mode;
  if (mode === 'one') { if (!D.done && D.picks[D.cur].tid !== S.user) aiPick(S); rerender(); return; }
  busy('On the clock', '', false);
  await sleep(20);
  let n = 0;
  while (!D.done && !(D.picks[D.cur].tid === S.user && mode === 'mine')) { if (D.picks[D.cur].tid === S.user && mode === 'all') { aiPick(S); continue; } aiPick(S); if (++n % 10 === 0) { busySub(`Pick ${D.cur + 1}`); await sleep(0); } }
  busy(null); autosave(); rerender();
  if (D.picks[D.cur] && D.picks[D.cur].tid === S.user && !D.done) toast("You're on the clock!", 'good');
};

// ---------- lottery ----------
Screens.lottery = {
  render() {
    const S = App.S;
    if (S.phase !== PH.LOTTERY && !S.lottery) return `${pageHead('Draft Lottery')}<div class="empty">The lottery is held after the playoffs.</div>`;
    if (!S.lottery) {
      const lt = lotteryTeams(S);
      return `${pageHead('Draft Lottery', `${S.season + 1} Draft · 14 non-playoff teams · top three picks are drawn`, btn('Run the Lottery', 'runLottery', 'gold lg'))}
        ${panel('Lottery Odds', sortTable('lo', [{ l: 'Seed', n: 1, f: (t) => lt.indexOf(t) + 1 }, { l: 'Team', f: t => `<span class="row tight">${logo(t, 22)} ${E(tname(t))}</span>` }, { l: 'Record', f: t => rec(t) }, { l: 'Odds for #1', n: 1, f: t => (LOTTO_ODDS[lt.indexOf(t)] / 10).toFixed(1) + '%' }], lt, { rowCls: t => t.tid === S.user ? 'me' : '' }), { flush: true })}`;
    }
    const L = S.lottery;
    const shown = App.lotShown != null ? App.lotShown : 0;
    const rows = L.results.slice().reverse().map((r, i) => {
      const t = S.teams[r.tid];
      const idx = L.results.length - 1 - i; // 13..0
      const vis = idx >= L.results.length - shown;
      const jump = r.seed - r.pick;
      return `<div class="lot-row ${vis ? 'reveal' : 'hidden'}" style="${r.tid === S.user && vis ? 'border-color:var(--gold)' : ''}"><div class="pk">${r.pick}</div><div class="row">${vis ? logo(t, 34) : ''}<div><div class="b">${vis ? E(tname(t)) : '???'}</div>${vis ? `<div class="tiny mute">Seed ${r.seed} · ${r.odds}% odds</div>` : ''}</div></div><div>${vis && jump > 0 ? `<span class="chip good">▲ ${jump}</span>` : vis && jump < 0 ? `<span class="chip bad">▼ ${-jump}</span>` : ''}</div></div>`;
    }).reverse().join('');
    const done = shown >= L.results.length;
    return `${pageHead('Draft Lottery', `${L.year} Draft order`, done ? btn('Enter the Draft Room ▸', 'goDraft', 'gold lg') : btn('Reveal All', 'lotAll', ''))}<div class="lotto" style="max-width:640px">${rows}</div>`;
  },
  after() {
    const S = App.S;
    if (!S.lottery || App.lotShown == null || App.lotShown >= S.lottery.results.length || App.lotTimer) return;
    App.lotTimer = setTimeout(() => { App.lotTimer = null; App.lotShown++; if (App.route === 'lottery') rerender(); }, App.lotShown >= S.lottery.results.length - 3 ? 1400 : 450);
  },
};
Act.runLottery = () => { const S = App.S; runLottery(S); S.phase = PH.DRAFT; App.lotShown = 0; autosave(); rerender(); };
Act.lotAll = () => { App.lotShown = App.S.lottery.results.length; rerender(); };

// ---------- fantasy draft ----------
Screens.fdraft = {
  render() {
    const S = App.S, F = S.fdraft;
    if (!F) return `${pageHead('Fantasy Draft')}<div class="empty">No fantasy draft in progress.</div>`;
    const pk = F.done ? null : F.picks[F.cur];
    const mine = pk && pk.tid === S.user;
    const pool = fdPool(S);
    const ros = U.sortBy(roster(S, S.user), p => p.ovr);
    const cols = [{ l: 'Player', k: 'n', s: p => p.ln, f: p => `${plink(p)} ${injChip(p)}` }, { l: 'Pos', k: 'pos', s: p => POS_IDX[p.pos], f: p => p.pos }, { l: 'Age', k: 'age', n: 1, f: p => p.age },
    { l: 'OVR', k: 'ovr', c: 1, f: p => rt(p.ovr) }, { l: 'POT', k: 'pot', c: 1, s: p => Math.max(p.pot, p.ovr), f: p => potStr(S, p) }, { l: 'Salary', k: 'sal', n: 1, s: p => p.contract.amt, f: p => `${U.money(p.contract.amt)} <span class="mute">× ${Math.max(1, p.contract.exp - S.season + 1)}</span>` },
    { l: 'Type', k: 'pers', f: p => `<span class="small mute">${PERSONALITIES[p.pers].n}</span>` }];
    if (mine) cols.push({ l: '', f: p => btn('Draft', 'fdPick', 'gold sm', { id: p.pid }) });
    const log = F.picks.slice(0, F.cur).reverse().slice(0, 40).map((k, i) => `<div class="row small" style="padding:3px 0;${k.tid === S.user ? 'color:var(--gold2)' : ''}"><span class="num dim" style="width:30px">${F.cur - i}</span>${logo(S.teams[k.tid], 18)}<b>${S.teams[k.tid].abbr}</b> ${plink(P(S, k.pid))} <span class="dim">${P(S, k.pid).pos} ${P(S, k.pid).ovr}</span></div>`).join('');
    return `${pageHead('Fantasy Draft', F.done ? 'Complete' : `Round ${pk.rd} of 13 · Pick ${F.cur + 1} of ${F.picks.length}`, F.done ? btn('Franchise Central ▸', 'go', 'gold', { r: 'home' }) : '')}
      <div class="grid g-main" style="margin-bottom:14px">
        ${panel(F.done ? 'Draft Complete' : mine ? '<span class="gold">You\'re on the clock!</span>' : 'On the Clock', F.done ? `<p>Rosters are set. Payroll: ${U.money(payroll(S, S.user))} (cap ${U.money(S.cap)}).</p>` : `<div class="row">${logo(S.teams[pk.tid], 56)}<div style="font:800 26px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(tname(S.teams[pk.tid]))}</div></div><hr class="sep"><div class="row">${mine ? btn('Auto-pick for me', 'fdAuto', '') : btn('Sim to my pick', 'fdSim', 'gold', { m: 'mine' })}${btn('Auto-draft the rest', 'fdSim', 'ghost', { m: 'all' })}</div>`)}
        ${panel(`Your Roster (${ros.length})`, ros.map(p => `<div class="row between small" style="padding:3px 0"><span><span class="dim">${p.pos}</span> ${plink(p)}</span><span>${rt(p.ovr)} <span class="mute num">${U.money(p.contract.amt)}</span></span></div>`).join('') || '<div class="empty small">No picks yet.</div>')}
      </div>
      ${F.done ? '' : panel('Player Pool', sortTable('fdpool', cols, pool, { sort: { k: 'ovr', d: true }, maxh: 640 }), { flush: true })}
      ${log ? panel('Recent Picks', log, { style: 'margin-top:14px' }) : ''}`;
  },
};
Act.fdPick = el => { const S = App.S; const p = fdPick(S, +el.dataset.id); toast(`You drafted ${pname(p)}.`, 'good'); autosave(); rerender(); };
Act.fdAuto = () => { const S = App.S; const p = fdAI(S); toast(`Staff drafted ${pname(p)}.`); autosave(); rerender(); };
Act.fdSim = async el => {
  const S = App.S, F = S.fdraft, m = el.dataset.m;
  busy('Fantasy draft', '');
  await sleep(20);
  let n = 0;
  while (!F.done && !(m === 'mine' && F.picks[F.cur].tid === S.user)) { fdAI(S); if (++n % 15 === 0) { busySub(`Pick ${F.cur + 1}`); await sleep(0); } }
  busy(null); autosave(); rerender();
  if (F.done) toast('Fantasy draft complete!', 'good');
};

// ---------- create-a-player ----------
Act.capOpen = () => { App.cap = App.cap || { fn: '', ln: '', pos: 'SF', age: 22, hgt: 79, arch: 0, ovr: 72, country: 'USA' }; capModal(); };
function capModal() {
  const C = App.cap;
  const archs = ARCH[C.pos];
  if (C.arch >= archs.length) C.arch = 0;
  const body = `<div class="grid g2">
    <label class="fld">First name<input type="text" maxlength="16" value="${E(C.fn)}" data-i="capF" data-k="fn"></label>
    <label class="fld">Last name<input type="text" maxlength="18" value="${E(C.ln)}" data-i="capF" data-k="ln"></label>
  </div>
  <div class="fld" style="margin-top:10px">Position ${seg('cappos', POSS.map(p => [p, p]), C.pos, 'capPos')}</div>
  <div class="fld" style="margin-top:10px">Style ${seg('caparch', archs.map((a, i) => [i, a[0]]), C.arch, 'capArch')}</div>
  <div class="grid g3" style="margin-top:10px">
    <label class="fld">Age <b class="num" id="capAgeL">${C.age}</b><input type="range" min="19" max="36" value="${C.age}" data-i="capR" data-k="age"></label>
    <label class="fld">Height <b class="num" id="capHgtL">${U.hgt(C.hgt)}</b><input type="range" min="70" max="89" value="${C.hgt}" data-i="capR" data-k="hgt"></label>
    <label class="fld">Overall <b class="num" id="capOvrL">${C.ovr}</b><input type="range" min="45" max="99" value="${C.ovr}" data-i="capR" data-k="ovr"></label>
  </div>
  <p class="tiny mute">Your creation joins the free-agent pool with a fair asking price. Younger players get more upside.</p>`;
  modal('Create a Player', body, `${btn('Cancel', 'closeModal', 'ghost')}${btn('Create', 'capMake', 'gold')}`, { size: 'md' });
}
Act.capF = el => { App.cap[el.dataset.k] = el.value; };
Act.capR = el => { const k = el.dataset.k; App.cap[k] = +el.value; const l = $('#cap' + k[0].toUpperCase() + k.slice(1) + 'L'); if (l) l.textContent = k === 'hgt' ? U.hgt(+el.value) : el.value; };
Act.capPos = el => { App.cap.pos = el.dataset.k; App.cap.arch = 0; App.cap.hgt = Math.round(HGT[App.cap.pos][0]); capModal(); };
Act.capArch = el => { App.cap.arch = +el.dataset.k; capModal(); };
Act.capMake = () => {
  const S = App.S, C = App.cap;
  const fn = (C.fn || '').trim() || 'Rookie', ln = (C.ln || '').trim() || 'Phenom';
  // search for a talent level that lands on the requested overall
  let best = null;
  for (let i = 0; i < 40; i++) {
    const talent = 50 + (C.ovr - 70) / 0.85 + U.gauss(0, 1.5);
    const p = genPlayer(S, { pos: C.pos, talent, age: C.age, tid: -1, name: { fn, ln, country: C.country } });
    if (!best || Math.abs(p.ovr - C.ovr) < Math.abs(best.ovr - C.ovr)) best = p;
    if (Math.abs(p.ovr - C.ovr) <= 1) break;
  }
  const p = best;
  S.nextPid = Math.max(S.nextPid, p.pid + 1);
  const arch = ARCH[C.pos][C.arch];
  p.arch = arch[0];
  const hd = C.hgt - p.hgt; p.hgt = C.hgt; p.r.orb = U.clamp(p.r.orb + hd * 2, 15, 99); p.r.drb = U.clamp(p.r.drb + hd * 2, 15, 99); p.r.blk = U.clamp(p.r.blk + hd * 2, 15, 99); p.r.spd = U.clamp(p.r.spd - hd * 1.5, 15, 99);
  p.ovr = calcOvr(p.r, p.pos);
  const fix = C.ovr - p.ovr; if (fix) { for (const k in OVR_W[p.pos]) p.r[k] = Math.round(U.clamp(p.r[k] + fix, 15, 99)); p.ovr = calcOvr(p.r, p.pos); }
  p.pot = potFor(p.ovr, p.age); p.yrsPro = Math.max(0, C.age - 21); p.college = 'Created Player';
  p.draft = { year: S.season, rd: 0, pick: 0, tid: -1 };
  const a = contractAsk(S, p, -1); p.ask = { amt: a.amt, yrs: a.yrs, base: a.amt }; p.contract = { amt: a.amt, exp: S.season };
  if (S.phase === PH.FA && S.fa) p.fa = { offers: [] };
  addPlayer(S, p);
  App.cap = null; closeModal(); autosave(); rerender();
  toast(`${pname(p)} (${p.pos}, ${p.ovr} OVR) is in the free-agent pool.`, 'good');
  openPlayer(p.pid);
};

// ===== ui/screens_owner.js — finances, pricing, arena, staff, relocation =====
const REV_LABELS = { tix: 'Ticket sales', suites: 'Luxury suites', conc: 'Concessions', merch: 'Merchandise', park: 'Parking', media: 'Local TV & radio', tv: 'National TV share', po: 'Playoff gates', naming: 'Naming rights', ads: 'Sponsors & ads' };
const EXP_LABELS = { sal: 'Player salaries', staff: 'Staff salaries', ops: 'Arena operations', mkt: 'Marketing', tax: 'Luxury tax', build: 'Construction & upgrades', debt: 'Arena debt service' };
Screens.owner = {
  render() {
    const S = App.S, t = S.teams[S.user], L = t.fin;
    const last = t.finHist[t.finHist.length - 1];
    const rev = ledgerTotal(L.rev), exp = ledgerTotal(L.exp);
    const line = (lab, cur, prev) => `<tr><td>${lab}</td><td class="n">${U.money(cur, 2)}</td><td class="n mute">${prev != null ? U.money(prev, 2) : '—'}</td></tr>`;
    const cur = U.seasonLabel(offseason(S) ? S.season + 1 : S.season);
    const ledger = `<div class="tw"><table class="t"><thead><tr><th>Revenue</th><th class="n">${cur}</th><th class="n">Last season</th></tr></thead><tbody>${Object.keys(REV_LABELS).map(k => line(REV_LABELS[k], L.rev[k], last ? last.rev[k] : null)).join('')}<tr class="sep"><td class="b">Total revenue</td><td class="n b good">${U.money(rev, 2)}</td><td class="n mute">${last ? U.money(ledgerTotal(last.rev), 2) : '—'}</td></tr></tbody></table></div>
      <div class="tw" style="margin-top:12px"><table class="t"><thead><tr><th>Expenses</th><th class="n">${cur}</th><th class="n">Last season</th></tr></thead><tbody>${Object.keys(EXP_LABELS).map(k => line(EXP_LABELS[k], L.exp[k], last ? last.exp[k] : null)).join('')}<tr class="sep"><td class="b">Total expenses</td><td class="n b bad">${U.money(exp, 2)}</td><td class="n mute">${last ? U.money(ledgerTotal(last.exp), 2) : '—'}</td></tr></tbody></table></div>`;
    const hist = t.finHist.slice(-10);
    const chart = hist.length ? barChart(hist.map(h => ({ l: String(h.s).slice(2), v: h.profit / 1000 })), '$M profit') : '<div class="empty small">Your first season is still in progress.</div>';
    const pay = payroll(S, S.user);
    return `${pageHead("Owner's Box", `${E(S.ownerName)} · ${E(tname(t))}`, `${btn('Tickets & Pricing', 'go', '', { r: 'tickets' })}${btn('Arena', 'go', '', { r: 'arena' })}`)}
      <div class="grid g4" style="margin-bottom:14px">
        ${panel('Cash on Hand', `<div class="big ${t.cash < 0 ? 'bad' : ''}">${U.money(t.cash)}</div><div class="tiny mute">live balance</div>`)}
        ${panel('Profit to Date', `<div class="big ${rev - exp >= 0 ? 'good' : 'bad'}">${U.money(rev - exp)}</div><div class="tiny mute">${L.hg} home games played</div>`)}
        ${panel('Payroll', `<div class="big">${U.money(pay)}</div><div class="tiny ${pay > S.tax ? 'bad' : 'mute'}">${pay > S.tax ? `Over the tax line by ${U.money(pay - S.tax)} — taxed 1:1` : `Tax line ${U.money(S.tax)}`}</div>`)}
        ${panel('Attendance', `<div class="big">${L.hg ? Math.round(L.att / L.hg).toLocaleString() : '—'}</div><div class="tiny mute">capacity ${t.arena.cap.toLocaleString()} · ${L.sell} sellouts</div>`)}
      </div>
      <div class="grid g-main">
        ${panel('Ledger', ledger, { flush: true })}
        <div class="stack">
          ${panel('Profit History', chart)}
          ${panel('Marketing Budget', `<p class="small mute" style="margin-top:0">Advertising keeps hype from fading. Cost is per season.</p>${seg('mkt', MKT.map((m, i) => [i, `${m.n}${m.cost ? ' · ' + U.money(m.cost) : ''}`]), t.mkt, 'setMkt')}`)}
          ${panel('The Fan Base', `<div class="stack small">${meter('Fan happiness', t.fan)}${meter('Hype', t.hype)}</div><p class="tiny mute" style="margin-bottom:0">Fans respond to winning, fair prices and a good building. Hype drives demand; marketing keeps it up.</p>`)}
          ${t.debt ? panel('Arena Debt', `<div class="kv small"><span>Annual payment</span><span>${U.money(t.debt.amt)}</span><span>Years left</span><span>${t.debt.yrs}</span></div>`) : ''}
        </div>
      </div>`;
  },
};
Act.setMkt = el => { App.S.teams[App.S.user].mkt = +el.dataset.k; autosave(); rerender(); };
function barChart(data, unit) {
  const W = 360, H = 150, pad = 26;
  const mx = Math.max(1, ...data.map(d => Math.abs(d.v)));
  const hasNeg = data.some(d => d.v < 0);
  const zero = hasNeg ? pad + (H - pad * 2) / 2 : H - pad;
  const scale = (hasNeg ? (H - pad * 2) / 2 : H - pad * 2) / mx;
  const bw = (W - pad * 2) / data.length;
  const bars = data.map((d, i) => { const h = Math.abs(d.v) * scale; const y = d.v >= 0 ? zero - h : zero; return `<rect x="${pad + i * bw + 3}" y="${y}" width="${bw - 6}" height="${Math.max(1, h)}" rx="2" fill="${d.v >= 0 ? '#3ddc84' : '#ff5d5d'}"/><text x="${pad + i * bw + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#8e9cb6" font-family="Chakra Petch, monospace">'${d.l}</text><text x="${pad + i * bw + bw / 2}" y="${d.v >= 0 ? y - 3 : y + h + 10}" text-anchor="middle" font-size="9.5" fill="#e8eef8" font-family="Chakra Petch, monospace">${d.v.toFixed(1)}</text>`; }).join('');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%" role="img" aria-label="Profit by season">${`<line x1="${pad}" x2="${W - pad}" y1="${zero}" y2="${zero}" stroke="#33466b"/>`}${bars}<text x="4" y="12" font-size="10" fill="#8e9cb6">${unit}</text></svg>`;
}

Screens.tickets = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const pf = priceFactor(t.pop) * infl(S);
    const opp = S.teams[(S.user + 7) % 30];
    const g = gateProjection(S, t, null, 0);
    const seats = seatMap(t);
    const perGame = g.tix + g.conc + g.merch + g.park + g.suites;
    const fairTxt = g.fair < 0.85 ? ['good', 'A bargain — fans love it'] : g.fair < 1.05 ? ['good', 'Fair'] : g.fair < 1.2 ? ['warn', 'Steep — some grumbling'] : g.fair < 1.4 ? ['bad', 'Expensive — talk radio is furious'] : ['bad', 'Outrageous — expect empty seats'];
    const row = (k, label, unit) => {
      const ref = Math.round(REF[k] * pf);
      const step = k === 'court' ? 5 : k === 'suite' ? 5 : 1;
      const max = Math.round(ref * 2.6);
      return `<div class="stack" style="gap:4px;padding:8px 0;border-bottom:1px solid var(--line)"><div class="row between"><span class="b">${label} <span class="tiny mute">${unit}</span></span><span class="num gold" id="pl-${k}">${k === 'suite' ? U.money(t.prices[k]) : U.dollars(t.prices[k])}</span></div><input type="range" min="${Math.max(1, Math.round(ref * 0.3))}" max="${max}" step="${step}" value="${t.prices[k]}" data-i="setPrice" data-k="${k}" aria-label="${label} price"><div class="tiny dim">Fan-fair price ≈ ${k === 'suite' ? U.money(ref) : U.dollars(ref)}</div></div>`;
    };
    return `${pageHead('Tickets & Pricing', 'Set your prices. Projections assume an average opponent at current hype and record.', btn('Reset to fair prices', 'resetPrices', 'ghost'))}
      <div class="grid g-main">
        ${panel('Prices', PRICE_KEYS.map(([k, l, u]) => row(k, l, u)).join(''))}
        <div class="stack">
          ${panel('Projected Home Game', `<div class="kv"><span>Attendance</span><span class="b">${g.att.toLocaleString()} / ${g.cap.toLocaleString()}</span><span>Courtside fill</span><span>${Math.round(g.fill.court * 100)}% of ${seats.court}</span><span>Lower bowl fill</span><span>${Math.round(g.fill.lower * 100)}% of ${seats.lower.toLocaleString()}</span><span>Upper deck fill</span><span>${Math.round(g.fill.upper * 100)}% of ${seats.upper.toLocaleString()}</span><span>Suites leased</span><span>${Math.round(g.sOcc * 100)}% of ${t.arena.suites}</span></div>
            <hr class="sep"><div class="kv"><span>Tickets</span><span>${U.money(g.tix, 2)}</span><span>Concessions</span><span>${U.money(g.conc, 2)}</span><span>Merchandise</span><span>${U.money(g.merch, 2)}</span><span>Parking</span><span>${U.money(g.park, 2)}</span><span>Suites (per game)</span><span>${U.money(g.suites, 2)}</span><span class="b">Per game</span><span class="b gold">${U.money(perGame, 2)}</span><span class="b">Per season (41)</span><span class="b">${U.money(perGame * 41)}</span></div>`)}
          ${panel('Fan Reaction', `<div class="row"><span class="chip ${fairTxt[0]}">${fairTxt[1]}</span><span class="num mute">${Math.round(g.fair * 100)}% of fair</span></div><p class="small mute" style="margin-bottom:0">Fans weigh lower-bowl and upper-deck tickets most, then food, drinks and parking. Fan happiness moves a little after every home game.</p>`)}
          ${panel('Demand Drivers', `<div class="kv small"><span>Demand index</span><span>${Math.round(g.dem * 100)}</span><span>Hype</span><span>${Math.round(t.hype)}</span><span>Fan happiness</span><span>${Math.round(t.fan)}</span><span>Market</span><span>${t.pop.toFixed(1)}M</span><span>Arena condition</span><span>${Math.round(t.arena.cond)}</span></div>`)}
        </div>
      </div>`;
  },
};
Act.setPrice = el => {
  const S = App.S, t = S.teams[S.user], k = el.dataset.k;
  t.prices[k] = +el.value;
  const l = $('#pl-' + k); if (l) l.textContent = k === 'suite' ? U.money(t.prices[k]) : U.dollars(t.prices[k]);
  clearTimeout(App.priceT); App.priceT = setTimeout(() => { autosave(); rerender(); }, 250);
};
Act.resetPrices = () => { const S = App.S, t = S.teams[S.user], pf = priceFactor(t.pop) * infl(S); for (const [k] of PRICE_KEYS) t.prices[k] = Math.round(REF[k] * pf / (k === 'court' || k === 'suite' ? 5 : 1)) * (k === 'court' || k === 'suite' ? 5 : 1); autosave(); rerender(); };

Screens.arena = {
  render() {
    const S = App.S, t = S.teams[S.user], A = t.arena;
    const ups = Object.entries(UPGRADES).map(([k, u]) => {
      const lvl = A.up[k];
      const cost = lvl < 3 ? u.cost[lvl] * infl(S) : 0;
      return `<div class="row between" style="padding:10px 0;border-bottom:1px solid var(--line)"><div class="grow"><div class="b">${u.n} <span class="gold">${'★'.repeat(lvl)}<span class="dim">${'★'.repeat(3 - lvl)}</span></span></div><div class="small mute">${u.d}</div></div>${lvl < 3 ? btn(`Upgrade · ${U.money(cost)}`, 'buyUp', t.cash >= cost ? 'gold sm' : 'sm', { k }) : '<span class="chip gold">Maxed</span>'}</div>`;
    }).join('');
    const rc = renovateCost(t);
    const caps = [17500, 19000, 20500, 22000];
    const capSel = App.ui.arenaCap || 20500;
    const q = arenaQuote(S, t, capSel);
    const build = A.build ? `<p>Construction underway: <b>${A.build.cap.toLocaleString()} seats</b>, opens in ${A.build.left} season${A.build.left > 1 ? 's' : ''}. Your share: ${U.money(A.build.own)} financed over 15 years.</p>`
      : `<p class="small mute" style="margin-top:0">A new building resets condition, adds suites and gets the fans buzzing. The city chips in based on fan support.</p><div class="fld">Capacity ${seg('acap', caps.map(c => [c, c.toLocaleString()]), capSel, 'arenaCap')}</div>
        <div class="kv small" style="margin-top:10px"><span>Total cost</span><span>${U.money(q.cost)}</span><span>Public funding</span><span class="${q.pub >= 0.3 ? 'good' : 'warn'}">${Math.round(q.pub * 100)}%</span><span>Your share</span><span>${U.money(q.own)}</span><span>Annual debt payment</span><span>${U.money(Math.round(q.own / 15))} × 15 yrs</span><span>Construction</span><span>2 seasons</span></div>
        <div style="margin-top:10px">${btn('Break Ground', 'buildArena', 'gold')}</div>`;
    return `${pageHead('Arena', E(A.name))}
      <div class="grid g-main">
        ${panel('Upgrades', ups + `<p class="tiny mute">Upgrades take effect immediately. Cash: ${U.money(t.cash)}.</p>`)}
        <div class="stack">
          ${panel('The Building', `<div class="kv"><span>Name</span><span>${E(A.name)}</span><span>Capacity</span><span>${A.cap.toLocaleString()}</span><span>Luxury suites</span><span>${A.suites}</span><span>Opened</span><span>${A.built}</span><span>Naming rights</span><span>${A.naming ? `${E(A.naming.corp)} · ${U.money(A.naming.amt)}/yr · ${A.naming.yrs} yrs` : 'Unsold'}</span></div>
            <div style="margin-top:10px">${meter('Condition', A.cond)}</div><div class="row" style="margin-top:10px">${rc > 0 ? btn(`Renovate · ${U.money(rc)}`, 'renovate', t.cash >= rc ? 'gold sm' : 'sm') : '<span class="chip good">Spotless</span>'}${!A.naming ? btn('Shop naming rights', 'shopNaming', 'sm') : ''}</div>`)}
          ${panel('New Arena', build)}
          ${panel('In the Rafters', (t.rafters || []).length ? `<div class="row">${t.rafters.map(r => `<div class="c" style="background:${t.c1};color:${textOn(t.c1)};padding:10px 12px 14px;clip-path:polygon(0 0,100% 0,100% 85%,50% 100%,0 85%);min-width:84px"><div style="font:900 30px/1 var(--f-disp)">${r.num}</div><div class="tiny" style="white-space:normal">${E(r.n)}</div></div>`).join('')}</div>` : '<div class="small mute">No retired numbers yet. Honor a franchise great from his player card after he retires (four seasons with your team, or a Hall of Famer).</div>')}
        </div>
      </div>`;
  },
};
Act.buyUp = el => { const S = App.S, t = S.teams[S.user], k = el.dataset.k; const lvl = t.arena.up[k]; const cost = Math.round(UPGRADES[k].cost[lvl] * infl(S)); confirmBox(`Upgrade ${UPGRADES[k].n}?`, `Cost: ${U.money(cost)} from cash on hand (${U.money(t.cash)}).`, 'Buy', () => { const save = UPGRADES[k].cost[lvl]; UPGRADES[k].cost[lvl] = cost; const err = buyUpgrade(S, t, k); UPGRADES[k].cost[lvl] = save; if (err) toast(err, 'bad'); else { toast(`${UPGRADES[k].n} upgraded!`, 'good'); addNews(S, { type: 'arena', tids: [t.tid], local: true, h: `${t.name} invest ${U.money(cost)} in ${UPGRADES[k].n.toLowerCase()}`, b: `${S.ownerName} keeps spending on ${t.arena.name}.`, imp: 1 }); autosave(); } rerender(); }); };
Act.renovate = () => { const S = App.S, t = S.teams[S.user]; confirmBox('Renovate the arena?', `Restores condition to 100 for ${U.money(renovateCost(t))}.`, 'Renovate', () => { const err = renovate(S, t); if (err) toast(err, 'bad'); else { toast('Renovations complete.', 'good'); autosave(); } rerender(); }); };
Act.arenaCap = el => { App.ui.arenaCap = +el.dataset.k; rerender(); };
Act.buildArena = () => {
  const S = App.S, t = S.teams[S.user], cap = App.ui.arenaCap || 20500;
  const q = arenaQuote(S, t, cap);
  confirmBox('Break ground?', `A ${cap.toLocaleString()}-seat arena for ${U.money(q.cost)}. The city covers ${Math.round(q.pub * 100)}%; you finance ${U.money(q.own)} at ${U.money(Math.round(q.own / 15))} a year for 15 years. Opens in two seasons.`, 'Build It', () => {
    startArena(S, t, cap, q.pub);
    addNews(S, { type: 'arena', tids: [t.tid], h: `${tname(t)} break ground on a new arena`, b: `The ${cap.toLocaleString()}-seat building opens in two seasons. Public funding covers ${Math.round(q.pub * 100)}% of the ${U.money(q.cost)} price tag.`, imp: 3, local: true });
    t.hype = Math.min(100, t.hype + 6);
    autosave(); rerender(); toast('Shovels in the ground!', 'good');
  });
};
Act.shopNaming = () => { const S = App.S, t = S.teams[S.user]; offerNaming(S, t); toast('A sponsor sent a proposal to your inbox.'); autosave(); rerender(); };

Screens.staff = {
  render() {
    const S = App.S, t = S.teams[S.user];
    const canHire = S.phase >= PH.END || S.phase === PH.PRE;
    if (!S.staffPool) S.staffPool = genStaffPool(S);
    const rlab = { off: 'Offense', def: 'Defense', dev: 'Development', mot: 'Motivation', med: 'Medicine', cond: 'Conditioning', eval: 'Evaluation', net: 'Network' };
    const card = (st, role) => `<div class="panel" style="padding:12px"><div class="eyebrow">${STAFF_ROLES[role]}</div><div class="row between"><div style="font:800 22px/1.1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(staffName(st))}</div>${rt(staffOvr(st))}</div>
      <div class="kv small" style="margin-top:8px">${Object.entries(st.r).map(([k, v]) => `<span>${rlab[k]}</span><span>${v}</span>`).join('')}<span>Salary</span><span>${U.money(st.sal)}</span><span>Contract thru</span><span>${U.seasonLabel(st.exp)}</span>${role === 'hc' ? `<span>Record</span><span>${st.wins}-${st.losses}${st.titles ? ` · ${st.titles} title${st.titles > 1 ? 's' : ''}` : ''}</span>` : ''}</div>
      ${canHire && st.exp <= S.season + (offseason(S) ? 0 : -1) + 0 ? `<div style="margin-top:8px">${btn('Re-sign 3 yrs', 'staffResign', 'gold sm', { role })}</div>` : ''}</div>`;
    const pool = S.staffPool.map(st => `<tr><td>${STAFF_ROLES[st.role]}</td><td class="b">${E(staffName(st))}</td><td class="c">${rt(staffOvr(st))}</td><td class="small">${Object.entries(st.r).map(([k, v]) => `${rlab[k]} ${v}`).join(' · ')}</td><td class="n">${U.money(st.sal)}</td><td>${canHire ? btn('Hire', 'staffHire', 'sm gold', { id: st.id }) : ''}</td></tr>`).join('');
    return `${pageHead('Staff', canHire ? 'Hire and fire in the offseason and preseason.' : 'Staff moves open up after the season.')}
      <div class="grid g4">${['hc', 'asst', 'trainer', 'scout'].map(r => card(t.staff[r], r)).join('')}</div>
      <p class="tiny mute">Head coach offense/defense nudge every possession; development and your assistant drive offseason growth and camp gains; the trainer cuts injury time; the scout sharpens draft reads and adds scouting points.</p>
      ${panel('Available Staff', `<div class="tw"><table class="t"><thead><tr><th>Role</th><th>Name</th><th class="c">OVR</th><th>Ratings</th><th class="n">Asking</th><th></th></tr></thead><tbody>${pool}</tbody></table></div>`, { flush: true, style: 'margin-top:14px' })}`;
  },
};
Act.staffHire = el => {
  const S = App.S, t = S.teams[S.user];
  const st = S.staffPool.find(x => x.id === +el.dataset.id);
  const cur = t.staff[st.role];
  const left = Math.max(0, cur.exp - (offseason(S) ? S.season : S.season - 1));
  const buyout = left * cur.sal;
  confirmBox(`Hire ${E(staffName(st))}?`, `${E(staffName(cur))} will be let go${buyout ? ` (buyout ${U.money(buyout)})` : ''}. ${E(staffName(st))} signs for 3 seasons at ${U.money(st.sal)} a year.`, 'Hire', () => {
    t.cash -= buyout; t.fin.exp.staff += buyout;
    st.exp = (offseason(S) ? S.season + 1 : S.season) + 2;
    t.staff[st.role] = st;
    S.staffPool = S.staffPool.filter(x => x !== st);
    cur.exp = S.season; S.staffPool.push(cur);
    if (st.role === 'hc') addNews(S, { type: 'coach', tids: [t.tid], h: `${tname(t)} hire ${staffName(st)} as head coach`, b: `${staffName(cur)} is out.`, imp: 2, local: true });
    if (st.role === 'scout') S.scout.max = scoutPoints(S);
    autosave(); rerender(); toast(`${staffName(st)} hired.`, 'good');
  });
};
Act.staffResign = el => { const S = App.S, t = S.teams[S.user], st = t.staff[el.dataset.role]; st.exp = (offseason(S) ? S.season + 1 : S.season) + 2; st.sal = Math.round(st.sal * 1.08 / 10) * 10; toast(`${staffName(st)} re-signed through ${U.seasonLabel(st.exp)}.`, 'good'); autosave(); rerender(); };

Screens.relocate = {
  render() {
    const S = App.S, t = S.teams[S.user];
    if (!offseason(S)) return `${pageHead('Relocation')}<div class="empty">Relocation requests can only be filed in the offseason.</div>`;
    const R = App.relo || (App.relo = { city: null, name: '', c1: t.c1, c2: t.c2 });
    const taken = new Set(S.teams.map(x => x.region));
    const cities = RELO_CITIES.filter(c => !taken.has(c[0]));
    const fee = Math.round(40000 * infl(S));
    const list = cities.map(([c, pop]) => `<button class="tcard ${R.city === c ? 'on' : ''}" style="width:100%" data-a="reloCity" data-c="${E(c)}"><div class="grow"><div class="b">${E(c)}</div><div class="tiny mute">Market ${pop.toFixed(1)}M · ${pop > t.pop ? '<span class="good">bigger</span>' : '<span class="warn">smaller</span>'} than ${E(t.region)}</div></div></button>`).join('');
    const pal = ['#c1272d', '#ff5a1f', '#ffb703', '#2a9d8f', '#1f7aff', '#4b2a8f', '#0a6e5c', '#1d3557', '#7b2cbf', '#d4af37', '#111827', '#e9ecef', '#00b4d8', '#8d99ae', '#ff4d8d', '#3a5a40'];
    const swatches = (key) => `<div class="row tight">${pal.map(c => `<button style="width:26px;height:26px;border-radius:4px;background:${c};border:2px solid ${R[key] === c ? '#fff' : 'transparent'};cursor:pointer" data-a="reloColor" data-k="${key}" data-c="${c}" aria-label="Color ${c}"></button>`).join('')}</div>`;
    const preview = R.city ? { tid: t.tid, abbr: reloAbbr(R.city), c1: R.c1, c2: R.c2, region: R.city, name: R.name || t.name } : null;
    return `${pageHead('Relocation', `Move the ${E(t.name)} to a new market. Fee ${U.money(fee)} plus a new arena.`)}
      <div class="grid g-main">
        ${panel('Candidate Cities', `<div class="grid g2" style="gap:6px;max-height:560px;overflow-y:auto">${list}</div>`)}
        <div class="stack">${panel('New Identity', `<label class="fld">Nickname<input type="text" maxlength="18" value="${E(R.name)}" placeholder="${E(t.name)}" data-i="reloName" id="reloName"></label>
          <div class="tiny mute" style="margin:6px 0">Ideas: ${U.shuffle(NICK_IDEAS.slice()).slice(0, 6).join(', ')}</div>
          <div class="fld">Primary color${swatches('c1')}</div><div class="fld" style="margin-top:8px">Secondary color${swatches('c2')}</div>
          ${preview ? `<div class="row" style="margin-top:14px">${logo(preview, 64)}<div style="font:800 26px/1 var(--f-disp);text-transform:uppercase;transform:skewX(-8deg)">${E(preview.region)} ${E(preview.name)}</div></div>` : ''}`)}
          ${panel('Rebrand Only', `<p class="small mute" style="margin-top:0">Keep ${E(t.region)}, change the name and colors. New uniforms and signage cost ${U.money(Math.round(5000 * infl(S)))}.</p>${btn('Rebrand in ' + E(t.region), 'rebrandGo', '')}`)}
          ${panel('The Deal', R.city ? (() => { const pop = RELO_CITIES.find(c => c[0] === R.city)[1]; return `<div class="kv small"><span>Relocation fee</span><span>${U.money(fee)}</span><span>New market</span><span>${pop.toFixed(1)}M</span><span>Temporary arena</span><span>16,000 seats until the new one opens</span><span>New arena</span><span>20,500 seats, city pays ~45%</span><span>Your cash</span><span>${U.money(t.cash)}</span></div><div style="margin-top:12px">${btn('Move the Franchise', 'reloGo', 'gold')}</div>`; })() : '<div class="empty small">Pick a city.</div>')}</div>
      </div>`;
  },
};
Act.rebrandGo = () => {
  const S = App.S, t = S.teams[S.user], R = App.relo;
  const name = (R.name || '').trim();
  if (!name && R.c1 === t.c1 && R.c2 === t.c2) { toast('Pick a new nickname or colors first.', 'bad'); return; }
  const cost = Math.round(5000 * infl(S));
  confirmBox('Rebrand the franchise?', `The ${E(tname(t))} become the ${E(t.region)} ${E(name || t.name)} for ${U.money(cost)}.`, 'Rebrand', () => {
    const old = tname(t);
    t.cash -= cost; t.fin.exp.build += cost;
    if (name) t.name = name; t.c1 = R.c1; t.c2 = R.c2;
    t.hype = Math.min(100, t.hype + 6);
    addNews(S, { type: 'rebrand', tids: [t.tid], h: `${old} unveil a new identity: the ${tname(t)}`, b: 'New name, new colors, same city.', imp: 3, local: true });
    App.relo = null; autosave(); applyTeamTheme(); go('home'); toast(`Say hello to the ${tname(t)}!`, 'good');
  });
};
function reloAbbr(city) { const w = city.replace(/[^A-Za-z ]/g, '').split(' '); return (w.length > 1 ? w.map(x => x[0]).join('') : city.slice(0, 3)).toUpperCase().slice(0, 3); }
Act.reloCity = el => { App.relo.city = el.dataset.c; rerender(); };
Act.reloName = el => { App.relo.name = el.value; };
Act.reloColor = el => { App.relo[el.dataset.k] = el.dataset.c; rerender(); };
Act.reloGo = () => {
  const S = App.S, t = S.teams[S.user], R = App.relo;
  const fee = Math.round(40000 * infl(S));
  const name = (R.name || t.name).trim() || t.name;
  confirmBox('Move the franchise?', `The ${E(tname(t))} become the ${E(R.city)} ${E(name)}. ${U.money(fee)} relocation fee. This cannot be undone.`, 'Relocate', () => {
    const old = tname(t);
    const pop = RELO_CITIES.find(c => c[0] === R.city)[1];
    t.cash -= fee; t.fin.exp.build += fee;
    t.region = R.city; t.name = name; t.abbr = reloAbbr(R.city); t.c1 = R.c1; t.c2 = R.c2; t.pop = pop;
    t.hype = Math.min(100, t.hype + 22); t.fan = 72;
    t.arena = { name: `${R.city} Civic Arena`, cap: 16000, suites: 30, cond: 60, built: S.season - 20, up: { suites: 0, board: 0, conc: 0, prac: t.arena.up.prac, med: t.arena.up.med, fan: 0 }, build: null, naming: null };
    const q = arenaQuote(S, t, 20500);
    startArena(S, t, 20500, Math.max(q.pub, 0.45));
    const pf = priceFactor(pop) * infl(S);
    for (const [k] of PRICE_KEYS) t.prices[k] = Math.round(REF[k] * pf);
    addNews(S, { type: 'relocate', tids: [t.tid], h: `${old} relocate to ${R.city}`, b: `Meet the ${R.city} ${name}. A new 20,500-seat arena is on the way.`, imp: 5 });
    App.relo = null;
    autosave(); applyTeamTheme(); go('home'); toast(`Welcome to ${R.city}!`, 'good');
  });
};

// ===== ui/game.js — Game Day: pregame, live coach mode with animated court =====
Screens.game = {
  render(prm) {
    const S = App.S;
    if (App.game) return App.game.html();
    const g = userGameToday(S);
    if (!g) return `${pageHead('Game Day')}<div class="empty">No game for your team today. ${btn('Back', 'go', '', { r: 'home' })}</div>`;
    return pregame(S, g);
  },
  after() { if (App.game) App.game.mount(); },
};
function pregame(S, g) {
  const H = S.teams[g.h], A = S.teams[g.a];
  const us = S.teams[S.user];
  const five = t => { ensureRotation(S, t.tid); return t.rot.order.slice(0, 5).map(id => P(S, id)); };
  const col = t => `<div class="stack" style="gap:6px">${five(t).map(p => { const pg = perGame(seasonTotals(p, S.season, g.po ? 1 : 0).gp ? seasonTotals(p, S.season, g.po ? 1 : 0) : seasonTotals(p, S.season)); return `<div class="row between small"><span><span class="dim">${p.pos}</span> ${plink(p)}</span><span>${rt(p.ovr)} <span class="num mute">${pg.ppg.toFixed(1)} ppg</span></span></div>`; }).join('')}</div>`;
  const series = S.sched.filter(x => x.hs != null && ((x.h === g.h && x.a === g.a) || (x.h === g.a && x.a === g.h)));
  const sw = series.filter(x => (x.h === S.user) === (x.hs > x.as)).length;
  const calls = (map, cur, act) => `<div class="callgrid">${Object.entries(map).map(([k, v]) => `<button class="call ${cur === k ? 'on' : ''}" data-a="${act}" data-k="${k}"><b>${v.n}</b><span class="mute">${v.d}</span></button>`).join('')}</div>`;
  const sr = g.po ? seriesOf(S, g.h, g.a) : null;
  return `${pageHead('Game Day', g.po ? `${ROUND_NAMES[g.round]} · Game ${g.n} · ${S.teams[sr.hi].abbr} lead ${Math.max(...sr.w)}-${Math.min(...sr.w)}`.replace(/lead (\d)-\1/, 'tied $1-$1') : `Day ${S.day} · Season series ${sw}-${series.length - sw}`)}
    <div class="grid g2">
      ${panel(`<span class="row tight" style="display:inline-flex">${logo(A, 26)} ${E(tname(A))} <span class="mute small">(${rec(A)})</span></span>`, col(A))}
      ${panel(`<span class="row tight" style="display:inline-flex">${logo(H, 26)} ${E(tname(H))} <span class="mute small">(${rec(H)})</span></span>`, col(H))}
    </div>
    ${scoutReport(S, g)}
    <div class="grid g2" style="margin-top:14px">
      ${panel('Your Game Plan: Offense', calls(OFF_PLAYS, us.strat.off, 'stratOff'))}
      ${panel('Your Game Plan: Defense', calls(DEF_SCHEMES, us.strat.def, 'stratDef') + `<div style="margin-top:10px">${seg('pace', PACES.map((p, i) => [i, p]), us.strat.pace, 'stratPace')}</div>`)}
    </div>
    <div class="row" style="justify-content:center;margin-top:16px">${btn('Coach the Game', 'gameStart', 'gold lg', { m: 'coach' })}${btn('Watch', 'gameStart', 'lg', { m: 'watch' })}${btn('Quick Sim', 'gameQuick', 'lg ghost')}${btn('Rotation', 'go', 'ghost', { r: 'rotation' })}</div>`;
}
function teamSeasonTotals(S, tid) {
  const rows = S.players.flatMap(p => p.stats.filter(r => r.s === S.season && r.tid === tid && !r.po));
  return sumRows(rows);
}
function scoutReport(S, g) {
  const oppId = g.h === S.user ? g.a : g.h, opp = S.teams[oppId], us = S.teams[S.user];
  const ot = teamSeasonTotals(S, oppId);
  const games = Math.max(1, opp.rec.w + opp.rec.l);
  const oros = U.sortBy(roster(S, oppId).filter(p => !p.inj || p.inj.games <= 0), p => p.ovr);
  const uros = U.sortBy(roster(S, S.user).filter(p => !p.inj || p.inj.games <= 0), p => p.ovr);
  const avg = (ps, k) => U.avg(ps.slice(0, 8), p => p.r[k]);
  const notes = [], rec = { def: null, off: null };
  const tpRate = ot.fga ? ot.tpa / ot.fga : 0.2, tpPct = ot.tpa ? ot.tpm / ot.tpa : 0.35;
  if (ot.fga && tpRate > 0.22 && tpPct > 0.355) { notes.push(`They live behind the arc: ${(ot.tpa / games).toFixed(1)} threes a game at ${U.fg(ot.tpm, ot.tpa)}.`); rec.def = 'deny'; }
  const oHand = avg(oros, 'bhd'), oBig = Math.max(...oros.filter(p => p.pos === 'C' || p.pos === 'PF').slice(0, 2).map(p => p.ovr), 0);
  if (!rec.def && oHand < 52) { notes.push(`Their ball-handling is shaky (team handles ${Math.round(oHand)}). Pressure them.`); rec.def = 'press'; }
  if (!rec.def && oBig >= 84) { notes.push(`Their frontcourt is the problem: ${pname(oros.find(p => (p.pos === 'C' || p.pos === 'PF') && p.ovr === oBig))} (${oBig}).`); rec.def = 'paint'; }
  const star = U.maxBy(oros, p => { const t = seasonTotals(p, S.season); return t.gp ? t.pts / t.gp + 50 : p.ovr / 10; });
  if (star) { const pg = perGame(seasonTotals(star, S.season)); notes.push(`Stop ${pname(star)}${pg.gp ? `: ${pg.ppg.toFixed(1)} points a night` : ''}.`); }
  const ourBig = uros.filter(p => p.pos === 'C' || p.pos === 'PF')[0], theirIdf = avg(oros, 'idf'), ourTpt = avg(uros, 'tpt');
  if (uros[0] && uros[1] && uros[0].ovr - uros[1].ovr >= 6) { rec.off = 'iso'; notes.push(`Ride ${pname(uros[0])}. Nobody on their roster can guard him straight up.`); }
  else if (ourBig && ourBig.r.ins >= 75 && theirIdf < 52) { rec.off = 'post'; notes.push(`Their interior defense is soft. Feed ${pname(ourBig)} on the block.`); }
  else if (ourTpt >= 58) { rec.off = 'three'; notes.push(`Our shooters can stretch them out.`); }
  else rec.off = 'motion';
  const recs = `${rec.off ? `<span class="chip gold">Offense: ${OFF_PLAYS[rec.off].n}</span>` : ''} ${rec.def ? `<span class="chip gold">Defense: ${DEF_SCHEMES[rec.def].n}</span>` : ''}`;
  return panel(`Scouting Report · Asst. Coach ${E(staffName(us.staff.asst))}`, `<ul style="margin:0 0 10px;padding-left:18px">${notes.map(n => `<li class="small" style="margin:3px 0">${E(n)}</li>`).join('')}</ul><div class="row tight">${recs}${btn('Use these calls', 'useRecs', 'sm', { off: rec.off || '', def: rec.def || '' })}</div>`, { style: 'margin-top:14px' });
}
Act.useRecs = el => { const t = App.S.teams[App.S.user]; if (el.dataset.off) t.strat.off = el.dataset.off; if (el.dataset.def) t.strat.def = el.dataset.def; autosave(); rerender(); toast('Game plan set.'); };
Act.gameQuick = () => { simDays(1); };
Act.gameStart = el => {
  const S = App.S, g = userGameToday(S);
  if (!g) return;
  const side = g.h === S.user ? 0 : 1;
  const sim = new GameSim(S, g, { userSide: el.dataset.m === 'coach' ? side : -1, live: true });
  startGameView(sim, { g, side, watch: el.dataset.m === 'watch' });
};
function startGameView(sim, opts) {
  App.game = new GameView(sim, opts);
  render();
}

const SPOTS = [[0, 27], [-17, 19], [17, 17], [-7, 9], [6, 5]];
class GameView {
  constructor(sim, o) {
    this.sim = sim; this.o = o; this.side = o.side != null ? o.side : -1; this.watch = !!o.watch;
    this.speed = App.gameSpeed || 1; this.running = true; this.anims = []; this.cur = null; this.feed = [];
    this.pos = {}; this.ball = { x: 47, y: 25, z: 0 }; this.sel = null; this.finished = false; this.applied = false; this.lastTs = 0; this.poss = -1;
    this.pauseAtQ = !this.watch;
    for (const s of [0, 1]) sim.T[s].ps.forEach((g, i) => { this.pos[g.pid] = { x: 47 + (s ? 4 : -4) * (i % 5 + 1), y: 6 + (i % 5) * 9 }; });
    this.colors = [this.teamColor(0), this.teamColor(1)];
    if (this.colors[0].c1 === this.colors[1].c1 || colorDist(this.colors[0].c1, this.colors[1].c1) < 90) this.colors[1] = { c1: this.colors[1].c2, c2: this.colors[1].c1 };
    for (const e of sim.log) this.feed.push(e);
  }
  teamColor(s) { const t = this.sim.T[s].t; return t ? { c1: t.c1, c2: t.c2 } : (s === 0 ? { c1: '#1f4e8c', c2: '#ffffff' } : { c1: '#b5121b', c2: '#ffffff' }); }
  tinfo(s) { const T = this.sim.T[s]; return T.t || { tid: s === 0 ? 4 : 9, abbr: T.abbr, region: T.name, name: 'All-Stars', c1: this.colors[s].c1, c2: this.colors[s].c2 }; }
  pause() { this.running = false; }
  html() {
    const s = this.sim;
    const ctrl = this.side >= 0 && !this.watch;
    return `<div class="stack" style="gap:12px">
      <div id="gvScore">${this.scoreHtml()}</div>
      <div id="gvStrip">${this.stripHtml()}</div>
      <div class="grid g-main" style="gap:12px">
        <div class="stack" style="gap:12px">
          <div class="court-wrap" id="courtWrap"><canvas id="court" aria-label="Animated court view"></canvas></div>
          <div class="panel" style="padding:10px"><div class="row between">
            <div class="row tight">${btn(this.running ? '❚❚ Pause' : '▶ Play', 'gvPlay', 'sm', {})}${seg('spd', [[1, '1×'], [2, '2×'], [4, '4×'], [12, 'Max']], this.speed, 'gvSpeed')}</div>
            <div class="row tight">${btn('Sim Quarter', 'gvSimQ', 'sm')}${btn('Sim to End', 'gvSimEnd', 'sm')}${ctrl ? btn(`Timeout (${s.T[this.side].tos})`, 'gvTO', 'sm gold') : btn('Take Control', 'gvControl', 'sm gold')}</div>
          </div></div>
          <div id="gvCalls">${ctrl ? this.callsHtml() : ''}</div>
        </div>
        <div class="stack" style="gap:12px">
          <div id="gvLineup">${this.lineupHtml()}</div>
          ${panel('Play-by-Play', `<div class="pbp" id="gvPbp">${this.pbpHtml()}</div>`, { flush: true })}
        </div>
      </div>
      <details class="panel" id="gvBoxWrap"><summary style="padding:10px 12px;cursor:pointer" class="b">Box Score</summary><div id="gvBox" style="padding:0 12px 12px">${this.boxHtml()}</div></details>
    </div>`;
  }
  scoreHtml() {
    const s = this.sim;
    const team = (i, cls) => { const t = this.tinfo(i), T = s.T[i]; return `<div class="sb-team ${cls}" style="--tc:${this.colors[i].c1}">${logo(t, 46)}<div style="min-width:0"><div class="nm">${E(t.region || T.name)}</div><div class="meta">${E(T.abbr)} · Fouls ${T.qf}${T.qf >= 5 ? ' <b class="warn">BONUS</b>' : ''}</div><div class="tos">${[0, 1, 2, 3, 4, 5, 6].map(k => `<i class="${k < T.tos ? '' : 'u'}"></i>`).join('')}</div></div><div class="sc">${s.score[i]}</div></div>`; };
    const q = s.done ? 'Final' : s.q <= 4 ? `${U.ord(s.q)} Qtr` : `OT${s.q > 5 ? s.q - 4 : ''}`;
    return `<div class="scorebug">${team(1, 'away')}<div class="sb-mid"><div class="q">${q}</div><div class="clk">${s.done ? '0:00' : s.clockStr()}</div><div class="tiny mute">${s.done ? '' : (s.pos === 0 ? '▶ ' + s.T[0].abbr : s.T[1].abbr + ' ◀')}</div></div>${team(0, '')}</div>`;
  }
  stripHtml() {
    const s = this.sim;
    const tot = i => { const t = newLine(); for (const g of s.T[i].ps) for (const k in t) t[k] += g.st[k]; t.bench = U.sum(s.T[i].ps.filter(g => !g.starter), g => g.st.pts); return t; };
    const a = tot(1), h = tot(0);
    const cell = (l, x, y, hi) => `<div class="c" style="min-width:76px"><div class="eyebrow">${l}</div><div class="num small"><span class="${hi === 1 ? 'gold' : ''}">${x}</span> <span class="dim">·</span> <span class="${hi === 0 ? 'gold' : ''}">${y}</span></div></div>`;
    const pc = (m, n) => n ? Math.round(m / n * 100) + '%' : '—';
    const better = (x, y, low) => x === y ? -1 : (low ? x < y : x > y) ? 1 : 0;
    return `<div class="panel" style="padding:8px 10px"><div class="row" style="justify-content:space-around;gap:6px"><div class="tiny mute">${E(s.T[1].abbr)} · ${E(s.T[0].abbr)}</div>
      ${cell('FG', pc(a.fgm, a.fga), pc(h.fgm, h.fga), better(a.fgm / (a.fga || 1), h.fgm / (h.fga || 1)))}${cell('3PT', `${a.tpm}/${a.tpa}`, `${h.tpm}/${h.tpa}`, better(a.tpm, h.tpm))}${cell('FT', `${a.ftm}/${a.fta}`, `${h.ftm}/${h.fta}`, better(a.ftm, h.ftm))}
      ${cell('REB', a.orb + a.drb, h.orb + h.drb, better(a.orb + a.drb, h.orb + h.drb))}${cell('AST', a.ast, h.ast, better(a.ast, h.ast))}${cell('TO', a.tov, h.tov, better(a.tov, h.tov, true))}${cell('Bench', a.bench, h.bench, better(a.bench, h.bench))}</div></div>`;
  }
  callsHtml() {
    const T = this.sim.T[this.side];
    const c = (map, cur, act) => Object.entries(map).map(([k, v]) => `<button class="call ${cur === k ? 'on' : ''}" data-a="${act}" data-k="${k}" title="${E(v.d)}"><b>${v.n}</b></button>`).join('');
    return `<div class="grid g2" style="gap:12px">${panel('Offense', `<div class="callgrid">${c(OFF_PLAYS, T.strat.off, 'gvOff')}</div>`)}${panel('Defense', `<div class="callgrid">${c(DEF_SCHEMES, T.strat.def, 'gvDef')}</div><div style="margin-top:8px">${seg('gpace', PACES.map((p, i) => [i, p]), T.strat.pace, 'gvPace')}</div>`)}</div>`;
  }
  lineupHtml() {
    const s = this.sim;
    const sides = this.side >= 0 ? [this.side, 1 - this.side] : [0, 1];
    const blk = (si, full) => {
      const T = s.T[si];
      const on = T.ps.filter(g => g.on), bench = T.ps.filter(g => !g.on);
      const row = g => `<div class="pr ${this.sel === g.pid ? 'sel' : ''} ${g.out ? 'out' : ''}" ${full && !g.out ? `data-a="gvSel" data-id="${g.pid}"` : ''}><span class="jer" style="background:${this.colors[si].c1};color:${textOn(this.colors[si].c1)}">${g.p.num}</span><span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${E(pshort(g.p))} <span class="dim tiny">${g.p.pos}</span>${T.feed === g.pid ? ' <span class="chip gold">FEED</span>' : ''}</span><div class="bar e" title="Energy ${Math.round(g.energy * 100)}%"><i style="width:${Math.round(g.energy * 100)}%"></i></div><span class="num small ${g.fouls >= 5 ? 'bad' : g.fouls >= 4 ? 'warn' : 'mute'}">${g.fouls}F</span><span class="num small b" title="${g.st.fgm}-${g.st.fga} FG">${g.st.pts}</span></div>`;
      return `<div class="lineup">${on.map(row).join('')}${full ? `<div class="eyebrow" style="padding:8px 8px 4px">Bench</div>${bench.map(row).join('')}` : ''}</div>`;
    };
    const ctrl = this.side >= 0 && !this.watch;
    const T = ctrl ? s.T[this.side] : null;
    const head = ctrl ? `<div class="row between" style="padding:8px 10px;border-bottom:1px solid var(--line)"><label class="row tight small"><input type="checkbox" ${T.auto ? 'checked' : ''} data-c="gvAuto"> Auto-subs</label>${this.sel ? btn(T.feed === this.sel ? 'Stop feeding' : 'Feed him', 'gvFeed', 'sm', {}) : '<span class="tiny mute">Tap a player, then another, to sub</span>'}</div>` : '';
    return ctrl ? panel(`${E(s.T[this.side].abbr)} Lineup`, head + blk(this.side, true), { flush: true }) + `<div style="margin-top:12px">${panel(`${E(s.T[1 - this.side].abbr)} On Court`, blk(1 - this.side, false), { flush: true })}</div>`
      : `<div class="grid g2" style="gap:12px">${sides.map(si => panel(`${E(s.T[si].abbr)}`, blk(si, false), { flush: true })).join('')}</div>`;
  }
  pbpHtml() {
    return this.feed.slice(-120).reverse().filter(e => !(e.type === 'sub' && e.quiet)).map(e => {
      const cls = e.type === 'period' || e.type === 'final' ? 'per' : (e.type === 'shot' && e.made) || e.type === 'ft' && e.made ? 'score' : '';
      const big = (e.type === 'shot' && e.made && e.pts === 3) || e.blk || e.steal ? 'big' : '';
      const c = e.side >= 0 ? this.colors[e.side].c1 : 'transparent';
      return `<div class="e ${cls} ${big}"><span class="t">${e.type === 'period' || e.type === 'final' ? '' : `Q${e.q} ${Math.floor(e.clk / 60)}:${String(Math.floor(e.clk % 60)).padStart(2, '0')}`}</span><span>${e.side >= 0 && cls !== 'per' ? `<i class="tm" style="background:${c}"></i>` : ''}${E(e.text)}</span><span class="s">${e.sc[1]}-${e.sc[0]}</span></div>`;
    }).join('');
  }
  boxHtml() { const b = this.sim.box(); return [1, 0].map(i => `<div class="eyebrow" style="margin:10px 0 6px">${E(this.sim.T[i].abbr)}</div>${boxTable(App.S, b.teams[i], b)}`).join(''); }
  refresh(parts) {
    if (App.route !== 'game') return;
    if (!parts || parts.includes('score')) { const el = $('#gvScore'); if (el) el.innerHTML = this.scoreHtml(); const st = $('#gvStrip'); if (st) st.innerHTML = this.stripHtml(); }
    if (!parts || parts.includes('pbp')) { const el = $('#gvPbp'); if (el) el.innerHTML = this.pbpHtml(); }
    if (!parts || parts.includes('lineup')) { const el = $('#gvLineup'); if (el) el.innerHTML = this.lineupHtml(); }
    if (!parts || parts.includes('box')) { const w = $('#gvBoxWrap'); if (w && w.open) { const el = $('#gvBox'); if (el) el.innerHTML = this.boxHtml(); } }
  }
  mount() {
    this.cv = $('#court'); if (!this.cv) return;
    this.ctx = this.cv.getContext('2d');
    this.fit();
    if (!this.onResize) { this.onResize = () => this.fit(); window.addEventListener('resize', this.onResize); }
    const w = $('#gvBoxWrap'); if (w) w.addEventListener('toggle', () => { if (w.open) { const el = $('#gvBox'); if (el) el.innerHTML = this.boxHtml(); } });
    if (!this.loopOn) { this.loopOn = true; requestAnimationFrame(t => this.loop(t)); }
    if (this.finished) this.showFinal();
  }
  fit() { if (!this.cv) return; const r = this.cv.getBoundingClientRect(); this.cv.width = Math.round(r.width * devicePixelRatio); this.cv.height = Math.round(r.height * devicePixelRatio); this.sc = this.cv.width / 94; }
  // court coordinates: sim half-court (x lateral, y from baseline) → full court feet
  dir(side) { const right = this.sim.q <= 2 ? side === 0 : side === 1; return right; }
  toCourt(side, sx, sy) { return this.dir(side) ? { x: 94 - sy, y: 25 + sx } : { x: sy, y: 25 - sx }; }
  rim(side) { return this.dir(side) ? { x: 88.75, y: 25 } : { x: 5.25, y: 25 }; }
  formation(side) {
    const s = this.sim;
    const off = s.on(side).sort((a, b) => a.pi - b.pi), def = s.on(1 - side).sort((a, b) => a.pi - b.pi);
    const tgt = {};
    off.forEach((g, i) => { const sp = SPOTS[i]; tgt[g.pid] = this.toCourt(side, sp[0] + U.rf(-2.5, 2.5), sp[1] + U.rf(-2, 2)); });
    def.forEach((g, i) => { const sp = SPOTS[i]; const o = this.toCourt(side, sp[0] * 0.82, sp[1] * 0.72 + 1.5); tgt[g.pid] = o; });
    return { tgt, handler: off[0] };
  }
  push(a) { this.anims.push(a); }
  moveAll(tgt, dur) { const from = {}; for (const k in tgt) from[k] = Object.assign({}, this.pos[k] || tgt[k]); this.push({ dur, fn: t => { const e = ease(t); for (const k in tgt) { if (!this.pos[k]) this.pos[k] = {}; this.pos[k].x = from[k].x + (tgt[k].x - from[k].x) * e; this.pos[k].y = from[k].y + (tgt[k].y - from[k].y) * e; } } }); }
  ballTo(getTo, dur, arc = 0, onEnd) { let from; this.push({ dur, start: () => { from = Object.assign({}, this.ball); }, fn: t => { const to = getTo(); const e = arc ? t : ease(t); this.ball.x = from.x + (to.x - from.x) * e; this.ball.y = from.y + (to.y - from.y) * e; this.ball.z = arc ? Math.sin(Math.PI * t) * arc : 0; }, end: onEnd }); }
  wait(dur, onEnd) { this.push({ dur, fn: () => { }, end: onEnd }); }
  pop(text, at, color) {
    const wrap = $('#courtWrap'); if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'court-pop'; el.textContent = text; el.style.left = (at.x / 94 * 100) + '%'; el.style.top = (at.y / 50 * 100) + '%'; if (color) el.style.color = color;
    wrap.appendChild(el); setTimeout(() => el.remove(), 1000);
  }
  nextPossession() {
    const s = this.sim;
    if (s.done) { if (!this.finished) this.finish(); return; }
    const q0 = s.q;
    const evs = s.step();
    const side = evs.find(e => ['shot', 'tov', 'ft'].includes(e.type));
    const off = side ? side.side : s.pos;
    let setup = false;
    const doSetup = (sd) => { if (setup) return; setup = true; const f = this.formation(sd); this.moveAll(f.tgt, 420); const h = f.handler; this.ballTo(() => this.pos[h.pid] || { x: 47, y: 25 }, 200); };
    const show = (e) => this.wait(1, () => { this.feed.push(e); this.refresh(['score', 'pbp', 'lineup']); });
    for (const e of evs) {
      if (e.type === 'shot') {
        doSetup(e.side);
        const sp = this.toCourt(e.side, e.x, e.y), rim = this.rim(e.side);
        const shooter = e.pid;
        const tg = {}; tg[shooter] = sp;
        const d = s.matchup(e.side, s.T[e.side].ps.find(g => g.pid === shooter));
        if (d) tg[d.pid] = { x: sp.x + (rim.x - sp.x) * 0.15, y: sp.y + (rim.y - sp.y) * 0.15 };
        this.ballTo(() => this.pos[shooter] || sp, 220);
        this.moveAll(tg, 260);
        this.ballTo(() => rim, 520, e.zone === 'rim' ? 3 : e.zone === 'close' ? 5 : 9, () => {
          this.feed.push(e); this.refresh(['score', 'pbp', 'lineup']);
          if (e.made) this.pop(e.pts === 3 ? '+3' : '+2', rim, e.pts === 3 ? '#ffd479' : '#fff');
          else if (e.blk) this.pop('BLOCKED!', rim, '#ff5d5d');
        });
        if (e.made) this.wait(160);
      } else if (e.type === 'reb') {
        const rim = this.rim(e.off ? e.side : 1 - e.side);
        const rb = e.pid; const spot = { x: rim.x + (rim.x > 47 ? -U.rf(3, 9) : U.rf(3, 9)), y: rim.y + U.rf(-8, 8) };
        const tg = {}; tg[rb] = spot; this.moveAll(tg, 200);
        this.ballTo(() => this.pos[rb] || spot, 220, 2, () => { this.feed.push(e); this.refresh(['pbp', 'lineup']); });
      } else if (e.type === 'tov') {
        doSetup(e.side);
        if (e.steal) { this.ballTo(() => this.pos[e.by] || { x: 47, y: 25 }, 260, 0, () => { this.feed.push(e); this.refresh(['pbp', 'lineup']); this.pop('STEAL', this.pos[e.by] || { x: 47, y: 25 }, '#5cc8ff'); }); }
        else { this.ballTo(() => ({ x: this.ball.x, y: this.ball.y > 25 ? 51 : -1 }), 260, 0, () => { this.feed.push(e); this.refresh(['pbp', 'lineup']); this.pop('TURNOVER', { x: this.ball.x, y: 25 }, '#ff5d5d'); }); }
      } else if (e.type === 'ft') {
        const rim = this.rim(e.side); const line = { x: rim.x + (rim.x > 47 ? -15 : 15), y: 25 };
        const tg = {}; tg[e.pid] = line; this.moveAll(tg, 260);
        this.ballTo(() => this.pos[e.pid] || line, 120);
        for (let k = 0; k < e.n; k++) { this.ballTo(() => rim, 420, 6, () => { if (k < e.made) this.pop('+1', rim, '#fff'); }); if (k < e.n - 1) this.ballTo(() => this.pos[e.pid] || line, 150); }
        this.wait(1, () => { this.feed.push(e); this.refresh(['score', 'pbp', 'lineup']); });
      } else if (e.type === 'period' || e.type === 'final') {
        this.wait(e.type === 'final' ? 300 : 650, () => { this.feed.push(e); this.refresh(); });
      } else if (e.type === 'timeout' || e.type === 'inj' || e.type === 'foulout') {
        this.wait(500, () => { this.feed.push(e); this.refresh(['score', 'pbp', 'lineup']); this.pop(e.type === 'timeout' ? 'TIMEOUT' : e.type === 'inj' ? 'INJURY' : 'FOULED OUT', { x: 47, y: 25 }, '#ffb627'); });
      } else show(e);
    }
    this.wait(this.anims.length ? 120 : 1, () => this.refresh(['score']));
    if (this.pauseAtQ && s.q !== q0 && !s.done) this.wait(1, () => { this.running = false; this.refresh(); this.updatePlayBtn(); toast(`End of the ${U.ord(q0)}${q0 > 4 ? ' OT' : ' quarter'}. Make your adjustments, then press Play.`); });
  }
  updatePlayBtn() { const b = $$('[data-a="gvPlay"]')[0]; if (b) b.innerHTML = `<span>${this.running ? '❚❚ Pause' : '▶ Play'}</span>`; }
  loop(ts) {
    if (App.game !== this) { this.loopOn = false; if (this.onResize) window.removeEventListener('resize', this.onResize); return; }
    const dt = this.lastTs ? Math.min(100, ts - this.lastTs) : 16;
    this.lastTs = ts;
    if (this.running && App.route === 'game') {
      let budget = dt * this.speed;
      let guard = 0;
      while (budget > 0 && guard++ < 50) {
        if (!this.cur) {
          if (!this.anims.length) { if (this.running && !this.finished) this.nextPossession(); if (!this.anims.length) break; }
          this.cur = this.anims.shift(); this.cur.t = 0; if (this.cur.start) this.cur.start();
        }
        const a = this.cur;
        const need = a.dur * (1 - a.t);
        const use = Math.min(budget, need);
        a.t += use / a.dur; budget -= use;
        a.fn(Math.min(1, a.t));
        if (a.t >= 0.999) { if (a.end) a.end(); this.cur = null; if (!this.running) break; }
      }
    }
    if (App.route === 'game') this.draw();
    requestAnimationFrame(t => this.loop(t));
  }
  draw() {
    const c = this.ctx, cv = this.cv; if (!c || !cv || !document.body.contains(cv)) return;
    const k = this.sc, W = cv.width, H = cv.height;
    const X = x => x * k, Y = y => y * k;
    // hardwood
    c.fillStyle = '#c48a4f'; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 50; i++) { c.fillStyle = i % 2 ? 'rgba(120,70,30,0.10)' : 'rgba(255,220,170,0.06)'; c.fillRect(0, Y(i), W, Y(1)); }
    // paint in home colors
    const hc = this.colors[0].c1;
    c.globalAlpha = 0.55; c.fillStyle = hc; c.fillRect(0, Y(17), X(19), Y(16)); c.fillRect(X(75), Y(17), X(19), Y(16)); c.globalAlpha = 1;
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = Math.max(1.5, k * 0.18);
    c.strokeRect(X(0.2), Y(0.2), X(93.6), Y(49.6));
    c.beginPath(); c.moveTo(X(47), 0); c.lineTo(X(47), H); c.stroke();
    c.beginPath(); c.arc(X(47), Y(25), X(6), 0, Math.PI * 2); c.stroke();
    c.beginPath(); c.arc(X(47), Y(25), X(2), 0, Math.PI * 2); c.stroke();
    for (const side of [0, 1]) {
      const bx = side ? 88.75 : 5.25, dirn = side ? -1 : 1, base = side ? 94 : 0;
      c.strokeRect(X(side ? 75 : 0), Y(17), X(19), Y(16));
      c.beginPath(); c.arc(X(base + dirn * 19), Y(25), X(6), side ? Math.PI / 2 : -Math.PI / 2, side ? Math.PI * 1.5 : Math.PI / 2); c.stroke();
      c.beginPath(); c.moveTo(X(base), Y(3)); c.lineTo(X(base + dirn * 14), Y(3)); c.moveTo(X(base), Y(47)); c.lineTo(X(base + dirn * 14), Y(47)); c.stroke();
      c.beginPath(); const th = Math.asin(22 / 23.75); if (side) c.arc(X(bx), Y(25), X(23.75), Math.PI - th, Math.PI + th); else c.arc(X(bx), Y(25), X(23.75), -th, th); c.stroke();
      c.beginPath(); c.moveTo(X(base + dirn * 4), Y(22)); c.lineTo(X(base + dirn * 4), Y(28)); c.stroke();
      c.strokeStyle = '#ff7a1a'; c.beginPath(); c.arc(X(bx), Y(25), X(0.75), 0, Math.PI * 2); c.stroke(); c.strokeStyle = 'rgba(255,255,255,0.85)';
    }
    // center logo text
    c.save(); c.globalAlpha = 0.22; c.fillStyle = hc; c.font = `italic 800 ${Math.round(X(4))}px "Saira Condensed", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(this.sim.T[0].abbr, X(47), Y(25)); c.restore();
    // players
    const r = 1.35;
    for (const s of [0, 1]) for (const g of this.sim.on(s)) {
      const p = this.pos[g.pid]; if (!p) continue;
      c.beginPath(); c.arc(X(p.x), Y(p.y) + k * 0.4, X(r), 0, Math.PI * 2); c.fillStyle = 'rgba(0,0,0,0.25)'; c.fill();
      c.beginPath(); c.arc(X(p.x), Y(p.y), X(r), 0, Math.PI * 2); c.fillStyle = this.colors[s].c1; c.fill(); c.lineWidth = Math.max(1.5, k * 0.25); c.strokeStyle = this.colors[s].c2; c.stroke();
      if (g.energy < 0.8) { c.beginPath(); c.arc(X(p.x), Y(p.y), X(r + 0.35), -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * g.energy); c.strokeStyle = g.energy < 0.65 ? '#ff5d5d' : '#ffcc4d'; c.lineWidth = Math.max(1.5, k * 0.22); c.stroke(); }
      if (this.sel === g.pid) { c.beginPath(); c.arc(X(p.x), Y(p.y), X(r + 0.7), 0, Math.PI * 2); c.strokeStyle = '#ffb627'; c.lineWidth = k * 0.3; c.stroke(); }
      c.fillStyle = textOn(this.colors[s].c1); c.font = `700 ${Math.round(X(1.3))}px "Chakra Petch", monospace`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(g.p.num, X(p.x), Y(p.y) + 1);
    }
    // ball
    const b = this.ball, bz = b.z || 0;
    c.beginPath(); c.arc(X(b.x), Y(b.y), X(0.55), 0, Math.PI * 2); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fill();
    c.beginPath(); c.arc(X(b.x), Y(b.y) - X(bz * 0.35), X(0.62 + bz * 0.04), 0, Math.PI * 2); c.fillStyle = '#ff7a1a'; c.fill(); c.strokeStyle = '#3a1a00'; c.lineWidth = Math.max(1, k * 0.1); c.stroke();
  }
  finish() {
    this.finished = true; this.running = false;
    this.refresh(); this.updatePlayBtn();
    this.showFinal();
  }
  showFinal() {
    const s = this.sim;
    const w = s.score[0] > s.score[1] ? 0 : 1;
    const pog = U.maxBy(s.T[w].ps, g => g.st.pts + (g.st.orb + g.st.drb) * 0.7 + g.st.ast * 0.8 + g.st.stl + g.st.blk);
    const userWon = this.o.side != null && this.o.side >= 0 ? w === this.o.side : null;
    const title = this.o.allstar ? `${w === 0 ? 'East' : 'West'} wins!` : userWon === true ? 'Victory!' : userWon === false ? 'Defeat' : 'Final';
    modal(title, `<div class="c"><div style="font:700 44px/1 var(--f-num)">${E(s.T[1].abbr)} ${s.score[1]} – ${s.score[0]} ${E(s.T[0].abbr)}</div><p class="mute">${s.q > 4 ? (s.q === 5 ? 'Overtime' : (s.q - 4) + ' overtimes') : 'Final'}</p>
      <p>Player of the game: <b>${E(pname(pog.p))}</b> — ${pog.st.pts} pts, ${pog.st.orb + pog.st.drb} reb, ${pog.st.ast} ast</p></div>`, btn('Continue', 'gvContinue', 'gold'), { size: 'sm', sticky: true });
  }
}
function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function colorDist(a, b) { const h = x => { const n = parseInt(x.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }; const p = h(a), q = h(b); return Math.sqrt((p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2); }

Act.gvPlay = () => { const G = App.game; if (!G || G.finished) return; G.running = !G.running; G.updatePlayBtn(); };
Act.gvSpeed = el => { const G = App.game; G.speed = +el.dataset.k; App.gameSpeed = G.speed; $$('[data-a="gvSpeed"]').forEach(b => b.classList.toggle('on', b.dataset.k === el.dataset.k)); };
Act.gvSimQ = () => { const G = App.game; if (!G || G.finished) return; G.anims = []; G.cur = null; const q = G.sim.q; while (!G.sim.done && G.sim.q === q) { const ev = G.sim.step(); G.feed.push(...ev); } G.formationSnap(); G.refresh(); if (G.sim.done) G.finish(); else if (G.pauseAtQ) { G.running = false; G.updatePlayBtn(); } };
Act.gvSimEnd = () => { const G = App.game; if (!G || G.finished) return; G.anims = []; G.cur = null; while (!G.sim.done) { const ev = G.sim.step(); G.feed.push(...ev); } G.refresh(); G.finish(); };
GameView.prototype.formationSnap = function () { const f = this.formation(this.sim.pos); for (const k in f.tgt) this.pos[k] = f.tgt[k]; };
Act.gvTO = () => { const G = App.game; if (G.sim.timeout(G.side)) { G.feed.push(G.sim.log[G.sim.log.length - 1]); G.refresh(); G.running = false; G.updatePlayBtn(); toast('Timeout. Adjust and press Play.'); } else toast('No timeouts left.', 'bad'); };
Act.gvControl = () => { const G = App.game; if (G.o.allstar || G.o.side == null || G.o.side < 0) { toast('Spectator mode for this one.'); return; } G.watch = false; G.side = G.o.side; G.sim.userSide = G.side; G.pauseAtQ = true; render(); };
Act.gvOff = el => { const G = App.game; G.sim.setPlay(G.side, el.dataset.k); $('#gvCalls').innerHTML = G.callsHtml(); };
Act.gvDef = el => { const G = App.game; G.sim.setDef(G.side, el.dataset.k); $('#gvCalls').innerHTML = G.callsHtml(); };
Act.gvPace = el => { const G = App.game; G.sim.setPace(G.side, +el.dataset.k); $('#gvCalls').innerHTML = G.callsHtml(); };
Act.gvAuto = el => { const G = App.game; G.sim.T[G.side].auto = el.checked; G.refresh(['lineup']); };
Act.gvFeed = () => { const G = App.game, T = G.sim.T[G.side]; T.feed = T.feed === G.sel ? null : G.sel; G.sel = null; G.refresh(['lineup']); };
Act.gvSel = el => {
  const G = App.game, id = +el.dataset.id, T = G.sim.T[G.side];
  if (G.sel == null || G.sel === id) { G.sel = G.sel === id ? null : id; G.refresh(['lineup']); return; }
  const a = T.ps.find(g => g.pid === G.sel), b = T.ps.find(g => g.pid === id);
  if (a.on !== b.on) {
    const out = a.on ? a : b, inn = a.on ? b : a;
    if (G.sim.sub(G.side, out.pid, inn.pid)) { G.feed.push(G.sim.log[G.sim.log.length - 1]); G.pos[inn.pid] = Object.assign({}, G.pos[out.pid] || { x: 47, y: 50 }); }
    G.sel = null;
  } else G.sel = id;
  G.refresh(['lineup', 'pbp']);
};
Act.gvContinue = () => {
  const G = App.game, S = App.S;
  closeModal();
  if (G.o.allstar) { App.game = null; if (S.allStar && !S.allStar.done.game) allStarFinish(S, G.sim); autosave(); go(S.allStar ? 'allstar' : 'home'); return; }
  if (!G.applied && G.o.g.hs == null) { G.applied = true; applyResult(S, G.o.g, G.sim); }
  App.game = null;
  // finish the rest of today's slate and turn the page
  for (const g of todaysGames(S)) if (g.hs == null) playGame(S, g);
  const res = endDay(S);
  autosave();
  if (S.phase === PH.END) { go('review'); return; }
  if (res === 'season-end') { toast('Regular season complete — the playoffs are set!', 'good'); go('playoffs'); return; }
  if (S.allStar && !S.allStar.finished) { go('allstar'); return; }
  go('home');
  openBox(G.o.g.gid);
};

// ===== ui/minigames.js — training camp drills and the Three-Point Shootout =====
const MiniGames = {};
document.addEventListener('keydown', e => {
  if (App.mg && App.mg.key) { const used = App.mg.key(e); if (used) e.preventDefault(); return; }
  if ((e.code === 'Space' || e.key === ' ') && App.route === 'game' && App.game && !App.modal && !/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) { e.preventDefault(); Act.gvPlay(); }
});
function mgOpen(title, intro, onStart, onSim) {
  modal(title, `<div class="mg" id="mg">${intro}<div class="row">${btn('Start Drill', 'mgStart', 'gold lg')}${onSim ? btn('Sim it', 'mgSim', 'ghost') : ''}</div></div>`, '', { size: 'md', sticky: true });
  App.mgStart = onStart; App.mgSim = onSim;
}
Act.mgStart = () => { const f = App.mgStart; App.mgStart = null; f(); };
Act.mgSim = () => { const f = App.mgSim; App.mgSim = null; App.mg = null; closeModal(); f(); };
function mgFinish(title, grade, lines, cb, detail) {
  App.mg = null;
  $('#mg').innerHTML = `<div class="c"><div class="eyebrow">${title}</div><div style="font:800 64px/1 var(--f-num);color:var(--gold);margin:8px 0">${U.grade(grade)}</div><p>${lines}</p>${btn('Continue', 'mgDone', 'gold lg')}</div>`;
  App.mgDone = () => { closeModal(); cb(grade, detail); };
}
Act.mgDone = () => { const f = App.mgDone; App.mgDone = null; if (f) f(); };
function countdown(el, n, done) { if (n <= 0) { done(); return; } el.textContent = n; setTimeout(() => countdown(el, n - 1, done), 550); }

// ---- Shooting: stop the sweeping meter in the green ----
MiniGames.shoot = (p, cb, opts = {}) => {
  const contest = !!opts.contest;
  const intro = `<p class="c" style="max-width:52ch">${contest ? `Three-Point Shootout: 25 balls in five racks, 60 seconds. The last ball in each rack is the money ball — worth 2.` : `Ten shots from around the arc and the elbows.`} Press <b>Space</b>, click, or tap <b>Shoot</b> when the marker is in the <span class="good">green</span>. ${E(pshort(p))}'s shooting widens the window.</p>`;
  mgOpen(contest ? 'Three-Point Shootout' : 'Shooting Clinic', intro, () => run(), contest ? null : () => cb(campSimGrade(App.S, p)));
  function run() {
    const W = 560, H = 300;
    $('#mg').innerHTML = `<div class="hud"><span>Score <span id="mgS" class="gold">0</span></span><span>Ball <span id="mgB">1</span>/${contest ? 25 : 10}</span>${contest ? '<span>Time <span id="mgT">60</span></span>' : ''}</div><canvas id="mgC" width="${W}" height="${H}" style="width:${W}px;max-width:100%"></canvas><button class="btn gold lg" id="mgShoot" data-a="mgShoot"><span>Shoot</span></button><div id="mgCd" style="font:800 40px/1 var(--f-num);color:var(--gold);height:40px"></div>`;
    const cv = $('#mgC'), c = cv.getContext('2d');
    const total = contest ? 25 : 10;
    let i = 0, score = 0, made = 0, t = 0, marker = 0, dirn = 1, speed = 0.95, state = 'cd', ballAnim = null, timeLeft = 60, last = 0;
    const racks = [[]];
    const rating = k => p.r[k];
    const spotType = n => contest ? 'tpt' : (n % 2 ? 'mid' : 'tpt');
    const zoneW = n => U.clamp(0.07 + (rating(spotType(n)) - 40) * 0.0026, 0.07, 0.22);
    const draw = () => {
      c.fillStyle = '#101827'; c.fillRect(0, 0, W, H);
      // floor and hoop
      c.fillStyle = '#7a5230'; c.fillRect(0, H - 50, W, 50);
      c.fillStyle = '#e8eef8'; c.fillRect(W - 70, 70, 8, 70);
      c.strokeStyle = '#ff7a1a'; c.lineWidth = 4; c.beginPath(); c.moveTo(W - 70, 120); c.lineTo(W - 120, 120); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.5; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(W - 118 + k * 11, 121); c.lineTo(W - 112 + k * 9, 142); c.stroke(); }
      // shooter
      c.fillStyle = App.S.teams[App.S.user].c1; c.beginPath(); c.arc(90, H - 80, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.font = '700 16px "Chakra Petch", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.num || '', 90, H - 80);
      // meter
      const mx = 40, my = 26, mw = W - 80, mh = 22, zw = zoneW(i);
      c.fillStyle = '#263552'; c.fillRect(mx, my, mw, mh);
      c.fillStyle = 'rgba(255,204,77,.55)'; c.fillRect(mx + mw * (0.5 - zw), my, mw * zw * 2, mh);
      c.fillStyle = '#3ddc84'; c.fillRect(mx + mw * (0.5 - zw / 2), my, mw * zw, mh);
      c.fillStyle = '#fff'; c.fillRect(mx + mw * marker - 2, my - 6, 4, mh + 12);
      if (contest) { const rk = Math.floor(i / 5), b = i % 5; c.fillStyle = '#8e9cb6'; c.font = '600 13px Barlow, sans-serif'; c.textAlign = 'left'; c.fillText(`Rack ${Math.min(5, rk + 1)}${b === 4 ? ' · MONEY BALL' : ''}`, 40, 70); }
      if (ballAnim) { const a = ballAnim, tt = Math.min(1, a.t); const x = 110 + (W - 135 - 110) * tt, y = H - 95 - Math.sin(Math.PI * tt) * 120 + (a.make ? 0 : tt > 0.9 ? (tt - 0.9) * 200 : 0) + tt * (120 - (H - 95)) * 1; c.fillStyle = a.money ? '#ff4d8d' : '#ff7a1a'; c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); c.fill(); }
      if (state === 'msg') { c.fillStyle = msg.ok ? '#3ddc84' : '#ff5d5d'; c.font = '800 34px "Saira Condensed", sans-serif'; c.textAlign = 'center'; c.fillText(msg.text, W / 2, H / 2); }
    };
    let msg = { text: '', ok: true };
    const shoot = () => {
      if (state !== 'aim') return;
      const zw = zoneW(i), d = Math.abs(marker - 0.5);
      let make = d <= zw / 2 ? true : d <= zw ? Math.random() < 0.45 : Math.random() < 0.04;
      const money = contest && i % 5 === 4;
      const pts = make ? (money ? 2 : 1) : 0;
      score += pts; made += make ? 1 : 0;
      if (contest) { racks[racks.length - 1].push(make ? 1 : 0); if (racks[racks.length - 1].length === 5 && racks.length < 5) racks.push([]); }
      ballAnim = { t: 0, make, money };
      state = 'flight';
      msg = { text: make ? (money ? 'MONEY!' : 'SWISH!') : (d <= zw ? 'Rims out' : 'Brick'), ok: make };
    };
    App.mg = { key: e => { if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') { shoot(); return true; } return false; } };
    App.mgShootFn = shoot;
    cv.addEventListener('pointerdown', shoot);
    const step = now => {
      if (!document.body.contains(cv)) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (contest && (state === 'aim' || state === 'flight' || state === 'msg')) { timeLeft -= dt; const te = $('#mgT'); if (te) te.textContent = Math.max(0, Math.ceil(timeLeft)); if (timeLeft <= 0) { end(); return; } }
      if (state === 'aim') { marker += dirn * speed * dt; if (marker > 1) { marker = 1; dirn = -1; } if (marker < 0) { marker = 0; dirn = 1; } }
      if (state === 'flight') { ballAnim.t += dt * 1.9; if (ballAnim.t >= 1) { state = 'msg'; t = 0; } }
      if (state === 'msg') { t += dt; if (t > (contest ? 0.35 : 0.6)) { i++; ballAnim = null; $('#mgS').textContent = score; if (i >= total) { end(); return; } $('#mgB').textContent = i + 1; speed = Math.min(2.2, speed + (contest ? 0.03 : 0.06)); marker = Math.random() < 0.5 ? 0 : 1; dirn = marker ? -1 : 1; state = 'aim'; } }
      draw();
      requestAnimationFrame(step);
    };
    const end = () => {
      state = 'done';
      while (contest && racks.length < 5) racks.push([]);
      const grade = contest ? U.clamp(score / 30 * 100, 0, 100) : made * 10;
      mgFinish(contest ? 'Shootout' : 'Shooting Clinic', grade, contest ? `${E(pname(p))} scored <b>${score}</b> points.` : `${E(pname(p))} made <b>${made}/10</b>.`, cb, { racks, tot: score, made });
    };
    draw();
    countdown($('#mgCd'), 3, () => { $('#mgCd').textContent = ''; state = 'aim'; requestAnimationFrame(step); });
  }
};
Act.mgShoot = () => { if (App.mgShootFn) App.mgShootFn(); };

// ---- Ball-handling: repeat the combo before the clock runs out ----
MiniGames.handle = (p, cb) => {
  const intro = `<p class="c" style="max-width:52ch">Eight combos. Repeat each one with the <b>arrow keys</b> (or the pad) before time runs out. Combos get longer. ${E(pshort(p))}'s handles buy extra time.</p>`;
  mgOpen('Ball-Handling Gauntlet', intro, () => run(), () => cb(campSimGrade(App.S, p)));
  function run() {
    const A = ['←', '↑', '→', '↓'], K = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3 };
    $('#mg').innerHTML = `<div class="hud"><span>Round <span id="hR">1</span>/8</span><span>Cleared <span id="hC" class="good">0</span></span><span>Time <span id="hT">0.0</span></span></div><div class="seq" id="hSeq"></div><div class="bar" style="width:min(420px,100%)"><i id="hBar" style="width:100%"></i></div>
      <div class="arrows"><span></span><button data-a="hIn" data-k="1" aria-label="Up">↑</button><span></span><button data-a="hIn" data-k="0" aria-label="Left">←</button><button data-a="hIn" data-k="3" aria-label="Down">↓</button><button data-a="hIn" data-k="2" aria-label="Right">→</button></div><div id="mgCd" style="font:800 40px/1 var(--f-num);color:var(--gold);height:40px"></div>`;
    let round = 0, cleared = 0, seq = [], pos = 0, limit = 0, left = 0, state = 'cd', last = 0, speedBonus = 0;
    const bonus = (p.r.bhd - 50) / 100;
    const newRound = () => {
      const len = Math.min(8, 3 + Math.floor(round / 1.5));
      seq = Array.from({ length: len }, () => U.ri(0, 3)); pos = 0;
      limit = Math.max(1.6, 4.2 - round * 0.28 + bonus * 1.6); left = limit;
      $('#hR').textContent = round + 1;
      $('#hSeq').innerHTML = seq.map(x => `<span>${A[x]}</span>`).join('');
      state = 'play';
    };
    const input = k => {
      if (state !== 'play') return;
      const spans = $$('#hSeq span');
      if (k === seq[pos]) { spans[pos].classList.add('done'); pos++; if (pos >= seq.length) { cleared++; speedBonus += left / limit; $('#hC').textContent = cleared; next(); } }
      else { spans[pos].classList.add('bad'); next(); }
    };
    const next = () => { state = 'gap'; round++; setTimeout(() => { if (round >= 8) end(); else newRound(); }, 350); };
    App.mg = { key: e => { if (K[e.key] != null) { input(K[e.key]); return true; } return false; } };
    App.hInput = input;
    const tick = now => {
      if (!$('#hSeq')) return;
      const dt = last ? (now - last) / 1000 : 0; last = now;
      if (state === 'play') { left -= dt; $('#hT').textContent = Math.max(0, left).toFixed(1); $('#hBar').style.width = Math.max(0, left / limit * 100) + '%'; if (left <= 0) next(); }
      if (state !== 'done') requestAnimationFrame(tick);
    };
    const end = () => { state = 'done'; const grade = U.clamp(cleared / 8 * 85 + speedBonus / 8 * 20, 0, 100); mgFinish('Ball-Handling Gauntlet', grade, `${E(pname(p))} cleared <b>${cleared}/8</b> combos.`, cb, { cleared }); };
    countdown($('#mgCd'), 3, () => { $('#mgCd').textContent = ''; newRound(); requestAnimationFrame(tick); });
  }
};
Act.hIn = el => { if (App.hInput) App.hInput(+el.dataset.k); };

// ---- Defensive slides: stay in front of the ball-handler ----
MiniGames.defense = (p, cb) => {
  const intro = `<p class="c" style="max-width:52ch">Twenty seconds of on-ball defense. Slide with <b>← →</b> (or hold the buttons, or drag on the court) to stay in front of the dribbler. ${E(pshort(p))}'s foot speed sets how quick you slide.</p>`;
  mgOpen('Defensive Slides', intro, () => run(), () => cb(campSimGrade(App.S, p)));
  function run() {
    const W = 560, H = 220;
    $('#mg').innerHTML = `<div class="hud"><span>In front <span id="dP" class="good">0%</span></span><span>Time <span id="dT">20.0</span></span></div><canvas id="mgC" width="${W}" height="${H}" style="width:${W}px;max-width:100%"></canvas><div class="row">${btn('◀ Slide', 'dHold', 'lg', { k: -1 })}${btn('Slide ▶', 'dHold', 'lg', { k: 1 })}</div><div id="mgCd" style="font:800 40px/1 var(--f-num);color:var(--gold);height:40px"></div>`;
    const cv = $('#mgC'), c = cv.getContext('2d');
    let ox = W / 2, tx = W / 2, dx = W / 2, vx = 0, left = 20, inFront = 0, frames = 0, state = 'cd', last = 0, retarget = 0, hold = 0, dragX = null;
    const dSpeed = 260 + (p.r.spd - 50) * 3 + (p.r.pdf - 50) * 2;
    const keys = {};
    App.mg = { key: e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { keys[e.key] = e.type !== 'keyup'; return true; } return false; } };
    const up = e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') keys[e.key] = false; };
    document.addEventListener('keyup', up);
    const toX = ev => { const r = cv.getBoundingClientRect(); return (ev.clientX - r.left) / r.width * W; };
    cv.addEventListener('pointerdown', ev => { dragX = toX(ev); cv.setPointerCapture(ev.pointerId); });
    cv.addEventListener('pointermove', ev => { if (dragX != null) dragX = toX(ev); });
    cv.addEventListener('pointerup', () => { dragX = null; });
    App.dHold = k => { hold = k; };
    const draw = (ok) => {
      c.fillStyle = '#c48a4f'; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.arc(W / 2, H + 120, 230, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(0, H - 24, W, 24);
      // offense
      c.fillStyle = '#5d6b85'; c.beginPath(); c.arc(ox, 70, 22, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ff7a1a'; c.beginPath(); c.arc(ox + Math.sin(performance.now() / 90) * 12, 98, 8, 0, Math.PI * 2); c.fill();
      // defender
      const t = App.S.teams[App.S.user];
      c.fillStyle = t.c1; c.beginPath(); c.arc(dx, 150, 24, 0, Math.PI * 2); c.fill(); c.strokeStyle = ok ? '#3ddc84' : '#ff5d5d'; c.lineWidth = 4; c.stroke();
      c.fillStyle = textOn(t.c1); c.font = '700 15px "Chakra Petch", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p.num || '', dx, 150);
      c.fillStyle = ok ? '#3ddc84' : '#ff5d5d'; c.font = '800 20px "Saira Condensed", sans-serif'; c.fillText(ok ? 'IN FRONT' : 'BLOWN BY', W / 2, 20);
    };
    const tick = now => {
      if (!document.body.contains(cv)) { document.removeEventListener('keyup', up); return; }
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (state === 'play') {
        left -= dt; retarget -= dt;
        if (retarget <= 0) { tx = U.rf(60, W - 60); retarget = U.rf(0.35, 0.85) - (20 - left) * 0.008; }
        const os = 300 + (20 - left) * 9;
        ox += U.clamp(tx - ox, -os * dt, os * dt);
        let dir = (keys.ArrowLeft ? -1 : 0) + (keys.ArrowRight ? 1 : 0) + hold;
        if (dragX != null) dir = U.clamp((dragX - dx) / 30, -1, 1);
        vx = dir * dSpeed; dx = U.clamp(dx + vx * dt, 24, W - 24);
        const ok = Math.abs(dx - ox) < 30;
        frames++; if (ok) inFront++;
        $('#dT').textContent = Math.max(0, left).toFixed(1); $('#dP').textContent = Math.round(inFront / frames * 100) + '%';
        draw(ok);
        if (left <= 0) { state = 'done'; document.removeEventListener('keyup', up); const pct = inFront / Math.max(1, frames); mgFinish('Defensive Slides', U.clamp((pct - 0.25) / 0.6 * 100, 0, 100), `${E(pname(p))} stayed in front <b>${Math.round(pct * 100)}%</b> of the time.`, cb, { pct }); return; }
      } else draw(true);
      requestAnimationFrame(tick);
    };
    countdown($('#mgCd'), 3, () => { $('#mgCd').textContent = ''; state = 'play'; requestAnimationFrame(tick); });
    requestAnimationFrame(tick);
  }
};
Act.dHold = el => { if (App.dHold) { App.dHold(+el.dataset.k); setTimeout(() => App.dHold && App.dHold(0), 180); } };
document.addEventListener('keyup', e => { if (App.mg && App.mg.key && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) App.mg.key({ key: e.key, type: 'keyup' }); });

// ===== ui/main.js — boot =====
(async function boot() {
  await Store.open();
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) { try { hot.snapshot(() => ({ slot: App.slot, route: App.route })); } catch (e) { } }
  const start = async (data) => {
    if (data && data.slot) { const ok = await loadSlot(data.slot); if (ok && data.route && Screens[data.route] && !['game', 'new'].includes(data.route)) go(data.route); return; }
    render();
  };
  if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
})();

})();