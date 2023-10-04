/**
 * Copyright (C) <ano>  Chifrudo <chifrudo@localhost.com.br>
 *
 * Este programa é um software livre: você pode redistribuí-lo e/ou
 * modificá-lo sob os termos da GNU General Public License conforme
 * publicada por a Free Software Foundation, seja a versão 3 da
 * Licença, ou (a seu critério) qualquer versão posterior.
 *
 * Este programa é distribuído na esperança de que seja útil,
 * mas SEM QUALQUER GARANTIA; mesmo sem a garantia implícita de
 * COMERCIABILIDADE ou ADEQUAÇÃO PARA UM FIM ESPECÍFICO. Veja a
 * Licença Pública Geral GNU para mais detalhes.
 *
 * Você deve ter recebido uma cópia da GNU General Public License
 * juntamente com este programa. Caso contrário, consulte
 * <https://www.gnu.org/licenses/>.
 */


var num_files;
var dropzone;
var curlist;
var outlist;
var numdisplay;
var files;
var scale_x = 1;
var scale_y = 1;
var digitsize = 1;
var palette;
var palettes;
var palette_name;
var palette_names;
var palette_elem;
var palette_elems;
var max = Math.max;
var min = Math.min;
var round = Math.round;
var abs = Math.abs;


/**
 *
 */
function load()
{
    /**
     * Configure as referências de elementos globais.
     */
    dropzone = document.getElementById("dropzone");
    curlist = document.getElementById("curlist");
    outlist = document.getElementById("outlist");
    numdisplay = document.getElementById("num_files");
    num_files = 0;

    /**
     * Configure os ouvintes de arrastar e soltar.
     *
     * dropzone.addEventListener("click", handleFileClick, false);
     */
    dropzone.onchange = handleInputChange;
    dropzone.ondragover = handleDragOver;
    dropzone.ondragleave = handleDragOff;
    dropzone.ondrop = handleFileSelect;

    /**
     * Configure as paletas.
     */
    initializePalettes();

    /**
     * Escala.
     *
     * var scales = document.getElementsByTagName("input"),
     *     alphas = ["x", "y"];
     *
     * for(var i = 0, scale, len = scales.length; i < len; ++i)
     * {
     *     scale = scales[i];
     *     scale.onclick = scale.onchange = scale.onkeydown = setScaleValue;
     *     scale.alpha = alphas[i];
     * }
     */
}

/**
 *
 */
function handleInputChange(event)
{
    dropzone.ondragleave();
    event.target.ondragleave();
    console.log(window.e = event);
}

/**
 *
 */
function handleFileSelect(event)
{
    preventAll(event);
    this.style.backgroundColor = "";

    var files = window.files = event.dataTransfer.files;
    var output = [];
    var type;

    for (var i = 0, f; f = files[i]; i++)
    {
        type = f.type.split("/")[1];

        /**
         * Somente imagens permitidas !
         */
        if (type == "gif" || type == "png" || type == "jpeg" || type == "jpg")
        {
            ++num_files;

            output.push("<li><strong>", f.name, "</strong> <grey>(", type, ")</grey>");
            outlist.appendChild(getWorkerElement(f));
        } else
        {
            output.push("<li>Apenas imagens são suportadas ! <grey>(" + type + ")</grey></li>");
        }
    }

    /**
     * Atualizar saída e lista de saída.
     */
    dropzone.innerHTML = files.length + " file" + (files.length == 1 ? "" : "s") + " selected"
    curlist.innerHTML = output.join("");

    /**
     * numdisplay.innerHTML = "Showing " + num_files + " file" + (num_files == 1 ? "" : "s") + ":";
     */
}

/**
 *
 */
function getWorkerElement(file)
{
    var element = getOutputListElement(file.name);
    var reader = new FileReader();

    /**
     * Configurar o upload do arquivo.
     */
    reader.onprogress = updateProgress;
    reader.element = element;

    /**
     * Depois que o upload terminar, inicie o trabalhador.
     */
    reader.onloadend = startWorking;

    /**
     * Inicie o carregamento.
     */
    reader.readAsDataURL(file);

    return element;
}

/**
 *
 */
function getOutputListElement(name)
{
    var element = document.createElement("li");
    var status = document.createElement("div");
    var progress = document.createElement("div");
    var base64 = document.createElement("div");
    var results = document.createElement("div");
    var close = document.createElement("div");

    element.name = name;
    element.statusbase = status.innerText = "Uploading " + name + "...";

    element.status = status;
    element.progress = progress
    element.base64 = base64,
    element.results = results;
    element.close = close;

    element.appendChild(status);
    element.appendChild(progress);
    element.appendChild(base64);
    element.appendChild(results);
    element.appendChild(close);

    status.className = "status";
    element.className = "output";
    progress.className = "progress";
    base64.className = "base64";
    results.className = "results";
    close.className = "close";

    setTextDisplayer(base64, "Base 64");
    setTextDisplayer(results, "Sprite");

    return element;
}

/**
 *
 */
function updateProgress(event)
{
    if (event.lengthComputable)
    {
        var percentLoaded = round((event.loaded / event.total) * 100);

        /**
         * Aumente o comprimento da barra de progresso.
         */
        if (percentLoaded <= 100)
        {
            this.element.status.innerText = this.element.statusbase + " (" + percentLoaded + "%)";
            this.element.progress.style.width = percentLoaded + "%";
        }
    }
}

/**
 *
 */
function startWorking(event)
{
    var reader = event.currentTarget;
    var element = reader.element;
    var result = reader.result;

    /**
     * Atualize visualmente.
     */
    setTimeout(function()
    {
        element.status.innerText = "Working on " + element.name + "...";
        element.progress.style.backgroundColor = "rgb(117,175,245)";
    }, 350);

    setDisplayerText(element.base64, result);

    /**
     * Crie a tela.
     */
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    /**
     * Crie a imagem.
     */
    var img = document.createElement("image");
        img.src = result;

    /**
     * Desenhe e analise a imagem depois de carregada.
     */
    img.onload = function()
    {
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        /**
         * var data = context.getImageData(0, 0, img.width / scale_x, img.height / scale_y);
         */
        var data = context.getImageData(0, 0, img.width, img.height);
        var output;

        /**
         * Atualize visualmente e depois trabalhe.
         */
        setTimeout(function()
        {
            element.status.innerHTML = "<strong>" + element.name + "</strong><weak><grey style='text-shadow:none;'>(" + palette_name + ")</grey></weak>";
            element.status.style.color = "white";
            element.progress.style.backgroundColor = "rgb(35,35,70)";

            /**
             * Passe os dados para o analisador (para fazer: use um
             * trabalhador).
             */
            output = parseData(data.data, element, palette);
            setDisplayerText(element.results, output);
        }, 350);
    }
}

/**
 *
 */
function parseData(data, element)
{
    var outs = [];
    var occurences = {};
    var me;
    var i;
    var j;
    var len = data.length;

    /**
     * Para cada pixel rgba, obtenha a cor mais próxima no atual palette_parsed.
     * Conte também as ocorrências.
     */
    for(i = 0, j = 0; i < len; i += 4, ++j)
    {
        /**
         * outs[j] = getClosestPalette(data.slice(i, i + 4));
         */
        me = outs[j] = getClosestPalette([data[i], data[i + 1], data[i + 2], data[i + 3]]);

        if (occurences[me])
        {
            ++occurences[me];
        } else
        {
            occurences[me] = 1;
        }
    }

    /**
     * Iterar, repetindo loops.
     */
    return combineSimilarChars(outs, getNewPaletteFromOccurences(occurences));
}

/**
 * Para fazer: permitir digitsize != 1 ?
 * Paletteinfo = [newpalette, digitsize]
 */
function combineSimilarChars(textraw, paletteinfo)
{
    var newpalette = paletteinfo[0];
    var digitsize = paletteinfo[1];
    var threshold = max(3, round(4 / digitsize));
    var text = "";
    var i;
    var j;
    var len;
    var cur;

    console.log(digitsize);

    for (i = 0, len = textraw.length; i < len; ++i)
    {
        j = i + 1;

        /**
         * Duplicatas encontradas.
         * A ordem é 'x char times ,'
         */
        cur = textraw[i];

        while (cur == textraw[j])
        {
            /**
             * += digitsize ?
             */
            ++j;
        }

        if (j - i > threshold)
        {
            text += "x" + makedigit(cur, digitsize, newpalette) + String(j - i) + ",";
            i = j - 1;
        } else
        {
            text += makedigit(cur, digitsize, newpalette);
        }
    }

    return "p[" + grabKeys(newpalette) + "]" + text;
}

/**
 *
 */
function getNewPaletteFromOccurences(occurences)
{
    var counts = [];
    var key;
    var len = 0;

    for (key in occurences)
    {
        counts[key] = len;
        ++len;
    }

    console.log(len);

    return [
        counts,
        getDigitSizeFromLength(len)
    ];
}

/**
 *
 */
function makedigit(num, digitsize, newpalette)
{
    return fillChars(max(0, digitsize - String(num).length), "0") + newpalette[num];
}

/**
 *
 */
function fillChars(num, a)
{
    var text = "";

    while (num--)
    {
        text += a;
    }

    return text;
}

/**
 *
 */
function grabKeys(object)
{
    var output = [];
    var i;

    for (i in object)
    {
        output.push(i);
    }

    return output.join(",");
}

/**
 *
 */
function getClosestPalette(rgba)
{
    var i;
    var bestloc;
    var diff;
    var bestdiff = Infinity;

    for(i = palette.length - 1; i >= 0; --i)
    {
        diff = arrayDiff(rgba, palette[i]);

        if (diff < bestdiff)
        {
            bestdiff = diff;
            bestloc = i;
        }
    }

    return bestloc;
}

/**
 * Assume tamanho igual.
 */
function arrayDiff(a, b)
{
    var sum = 0;
    var i;

    for (i = a.length - 1; i >= 0; --i)
    {
        sum += abs(a[i] - b[i]);
    }

    return sum;
}

/**
 *
 */
function arrayEquals(a,b)
{
    return !(a < b || b < a);
}

/**
 *
 */
function handleDragOver(event)
{
    preventAll(event);

    /**
     * Mostre explicitamente que esta é uma cópia.
     */
    event.dataTransfer.dropEffect = "copy";

    this.style.backgroundColor = "lightgrey";
}

/**
 *
 */
function handleDragOff(event)
{
    this.style.backgroundColor = "";
}

/**
 *
 */
function preventAll(event)
{
    event.stopPropagation();
    event.preventDefault();
}

/**
 *
 */
function setTextDisplayer(element, intitle)
{
    element.className += " displayer";

    var title = element.title = document.createElement("div");
    var display = element.display = document.createElement("input");
    var copyout = element.copyout = document.createElement("div");

    title.innerText = intitle + ": ";
    title.className = "title";
    display.className = "display";

    element.appendChild(title);
    element.appendChild(display);
}

/**
 *
 */
function setDisplayerText(element, text)
{
    element.display.value = text;
}

/**
 *
 */
function initializePalettes()
{
    palettes = [
        [
            [0,     0,   0,   0],
            [255, 255, 255, 255],
            [0,     0,   0, 255]
        ],
        [
            [0,     0,   0,   0],
            [255, 255, 255, 255],
            [0,     0,   0, 255],
            [199, 199, 192, 255],
            [128, 128, 128, 255]
        ],
        [
            [0, 0, 0, 0],

            /**
             * Grayscales (1-4).
             */
            [255, 255, 255, 255],
            [0,     0,   0, 255],
            [188, 188, 188, 255],
            [116, 116, 116, 255],

            /**
             * Reds & Browns (5-11).
             */
            [252, 216, 168, 255],
            [252, 152,  56, 255],
            [252, 116, 180, 255],
            [216,  40,   0, 255],
            [200,  76,  12, 255],
            [136, 112,   0, 255],
            [124,   7,   0, 255],

            /**
             * Greens (12-14, and 21).
             */
            [168, 250, 188, 255],
            [128, 208,  16, 255],
            [0,   168,   0, 255],

            /**
             * Blues (15-20).
             */
            [24,   60,  92, 255],
            [0,   128, 136, 255],
            [32,   56, 236, 255],
            [156, 252, 240, 255],
            [60,  188, 252, 255],
            [92,  148, 252, 255],

            /**
             * Greens (21) para Luigi.
             */
            [0, 130, 0, 255]
        ]
    ];

    palette_names = [
        "Black & White",
        "GameBoy",
        "Mario"
    ];

    var container = document.getElementById("palettes");
    var i;
    var j;
    var len;
    var current;
    var mine;
    var square;
    var squarein;

    palette_elems = [];

    for(i = 0, len = palettes.length; i < len; ++i)
    {
        current = palettes[i];
        palette_elems[i] = mine = document.createElement("div");
        mine.innerHTML = "<p class='palettename'>" + palette_names[i] + "</p>";

        /**
         * Adicione os quadrados.
         */
        for (j = 0; j < current.length; ++j)
        {
            square = document.createElement("div");
            squarein = document.createElement("div");
            square.className = "square";
            squarein.className = "squarein";
            squarein.style.background = getColorFromArray(current[j]);
            square.appendChild(squarein);
            mine.appendChild(square);
        }

        /**
         * Defina os eventos.
         */
        mine.palettenum = i;
        mine.onclick = setCurrentPalette;
        mine.className = "squares";

        container.appendChild(mine);
    }

    palette_elems[localStorage.palette_num || 0].click();
}

/**
 *
 */
function getColorFromArray(arr)
{
    /**
     * if (arr.reduce(sum) < 7)
     * {
     *     return "";
     * }
     */
    return "rgba(" + arr.join(", ") + ")";
}

/**
 *
 */
function setCurrentPalette(event)
{
    var num = this.palettenum;

    palette = palettes[num];
    palette_name = palette_names[num];

    digitsize = getDigitSize(palette);
    digitsize = palette.length >= 10 ? 2 : 1;

    if (palette_elem)
    {
        palette_elem.className = "squares";
    }

    palette_elem = this;
    this.className = "squares selected";

    localStorage.palette_num = num;
}

/**
 *
 */
function getDigitSize(palette)
{
    return Number(String(palette.length).length);
}

/**
 *
 */
function getDigitSizeFromLength(length)
{
    return Number(String(length).length);
}

/**
 *
 */
function setScaleValue(event)
{
    window["scale_" + this.alpha] = Number(this.value) || 1;
}

/**
 *
 */
function sum(a, b)
{
    return Number(a) + Number(b);
}
