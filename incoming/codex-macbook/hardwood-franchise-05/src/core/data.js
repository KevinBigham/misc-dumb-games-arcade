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
