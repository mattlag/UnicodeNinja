
function makeContent() {
    let con = '';

    con += makeCharSearchBar();

    if(app.settings.charSearch) {
        con += makeCharSearchResults();
    
    } else {
        for(let s=0; s<app.settings.selectedRanges.length; s++){
            con += getRangeContent(app.settings.selectedRanges[s]);
        }
        
        con += '<i class="light">add or remove ranges using the checkboxes on the left</i>';
    }

    con += '<br><br>';

    return con;
}

function getRangeContent(rid) {
    if (!app.rangeCache[rid]) app.rangeCache[rid] = makeRangeContent(rid);
    return app.rangeCache[rid];
}

function makeRangeContent(rid) {
    let range = getRange(rid);

    let rangeBeginBase = decToHex(range.begin).substr(2);
    if(rangeBeginBase === '0020') rangeBeginBase = '0000';

    let con = `
        <div class="contentCharBlock">
            <h3 class="title">
                ${range.name}
                <a href="https://www.wikipedia.org/wiki/${range.name.replace(/ /gi, '_')}_(Unicode_block)" 
                    target="_new" 
                    title="Wikipedia Link"
                    class="titleLink">
                    Wikipedia
                    </a>
                    <a href="https://www.unicode.org/charts/PDF/U${rangeBeginBase}.pdf" 
                    target="_new" 
                    title="Unicode Link" 
                    class="titleLink">
                    Unicode
                </a>
            </h3>
            <div class="actions">
                ${makeCloseButton(`clickRangeClose('${rid}');`)}
            </div>

            <div class="hex">&ensp;</div>
            <div class="hex">0</div>
            <div class="hex">1</div>
            <div class="hex">2</div>
            <div class="hex">3</div>
            <div class="hex">4</div>
            <div class="hex">5</div>
            <div class="hex">6</div>
            <div class="hex">7</div>
            <div class="hex">8</div>
            <div class="hex">9</div>
            <div class="hex">A</div>
            <div class="hex">B</div>
            <div class="hex">C</div>
            <div class="hex">D</div>
            <div class="hex">E</div>
            <div class="hex">F</div>
    `;

    for(let c=(range.begin*1); c<=(range.end*1); c++){
        if(c%16===0) {
            con += `
                <div class="hex"><span>${decToHex(c).substr(2, 3)}-</span></div>
            `;
        }

        con += makeTile(decToHex(c));
    }

    con += `</div>`;

    return con;
}

function clickRangeClose(rid) {
    deselectRange(rid);
    redraw();
}

function makeTile(char) {
    let name = getUnicodeName(char);
    let con = `<div class="charTile noChar" title="No character encoded\nat this code point">&nbsp;</div>`;

    if(name !== '{{no name found}}'){
        con = `
            <div 
                class="charTile" 
                style="font-family: ${app.settings.genericFontFamily};${name === '<control>'? ' color: #EEE;"' : '"'} 
                title="${getUnicodeName(char)}\n${char}"
                onClick="tileClick('${char}');"
            >&#${char.substring(1)};</div>
        `;
    }

    return con;
}

function makeCharDetail(char) {
    // console.log(`makeCharDetail: ${typeof char} ${char}`);

    let range = getRangeForChar(char);
    if(range.begin === 32) range.begin = 0x0000;
    // console.log(`range: ${JSON.stringify(range)}`);

    let rangeBeginBase = decToHex(range.begin).substr(2);
    // console.log(`rangeBeginBase: ${rangeBeginBase}`);
    
    let unicodeName = getUnicodeName(char).replace('<', '&lt;');
    // console.log(`name: ${name}`);

    let entityName = htmlEntityNameList[char];

    let charBase = char.substr(2);

    let con = `
        <h2>${unicodeName}</h2>
        <div class="twoColumn">
            <div class="colOne">
                <span 
                    class="bigCharTile"
                    style="font-family: ${app.settings.genericFontFamily};${unicodeName === '&lt;control>'? ' color: #EEE;"' : '"'} 
                >&#x${charBase};</span>
            </div>
            <div class="colTwo">
                <div class="twoColumn">
                    <span class="key light">HTML&nbsp;hex&nbsp;entity:</span>
                    <span class="value"><span class="copyCode">&amp;#x${parseInt(charBase, 16).toString(16)};</span></span>

                    <span class="key light">HTML&nbsp;decimal&nbsp;entity:</span>
                    <span class="value"><span class="copyCode">&amp;#x${parseInt(charBase, 16)};</span></span>

                    ${entityName?
                        `<span class="key light">HTML&nbsp;named&nbsp;entity:</span>
                        <span class="value"><span class="copyCode">&amp;${entityName};</span></span>`
                        : ''
                    }
                </div>
            </div>
        </div>
        <br><br>
        <h3>Unicode information</h3>
        <div class="twoColumn">
            <span class="key light">Unicode&nbsp;code&nbsp;point:</span>
            <span class="value"><pre>U+${charBase}</pre></span>

            <span class="key light">Member&nbsp;of&nbsp;range:</span>
            <span class="value">
                <pre>U+${decToHex(range.begin).substr(2)} - U+${decToHex(range.end).substr(2)}</pre>
                <span style="vertical-align: bottom; margin:2px; 0px 0px 10px;">${range.name}</span>
            </span>

            <span class="key light">More&nbsp;Info&nbsp;from&nbsp;Wikipedia:</span>
            <span class="value">
                <a href="https://www.wikipedia.org/wiki/${range.name.replace(/ /gi, '_')}_(Unicode_block)" 
                    target="_new" 
                    title="Wikipedia Link">
                    wikipedia.org/wiki/${range.name.replace(/ /gi, '_')}_(Unicode_block)
                </a>
            </span>

            <span class="key light">More&nbsp;Info&nbsp;from&nbsp;Unicode:</span>
            <span class="value">
                <a href="https://www.unicode.org/charts/PDF/U${rangeBeginBase}.pdf" 
                    target="_new" 
                    title="Wikipedia Link">
                    unicode.org/charts/PDF/U${rangeBeginBase}.pdf
                </a>
            </span>
        </div>
    `;

    return con;
}

function tileClick(char) {
    openDialog(makeCharDetail(char));
}


//
//  Char Name Search
//

function makeCharSearchBar() {
    return `
    <div class="charSearchBar">
        <span class="searchIcon">⚲</span>
        <input 
            type="text" 
            id="searchInput" 
            value="${app.settings.charSearch}" 
            onkeyup="updateCharSearch(this.value);"
        />
        ${makeCloseButton('clearSearch();')}
    </div>
    `;
}

function clearSearch() {
    app.settings.charSearch = '';
    document.getElementById('searchInput').value = '';
    redraw();
}

function makeCharSearchResults() {
    let results = searchCharNames(app.settings.charSearch);
    let con = '<br/>';
    console.log(results);

    results.map(function(value) {
        con += value.result;
        con += '<br/>';
    });

    return con;
}

function updateCharSearch(term) {
    app.settings.charSearch = term;
    saveSettings();
    redraw();
}

function searchCharNames(term) {
    term = term.toUpperCase();
    let max = 10;
    let count = 0;
    let currName;
    let currPos;
    let results = [];
    let currResult;

    for(let point in fullUnicodeNameList) {
        if(count < max) {
            if(fullUnicodeNameList.hasOwnProperty(point)) {
                currName = fullUnicodeNameList[point];
                currPos = currName.indexOf(term);

                if(currPos > -1) {
                    currResult = '<span>';
                    currResult += currName.substring(0, currPos);
                    currResult += '</span><span class="highlight">';
                    currResult += term;
                    currResult += '</span><span>';
                    currResult += currName.substring(currPos + term.length);
                    currResult += '</span>';
                    
                    results.push({char: point, result: currResult});
                    count++;
                }
            }
        } else {
            return results;
        }
    }

    return results;
}