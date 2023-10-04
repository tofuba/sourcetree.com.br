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


/**
 * sprites.js.
 * Contém funções para localizar, configurar e modificar sprites.
 */

/**
 * Redefine a tela principal e o contexto.
 */
function resetCanvas()
{
    /**
     * A tela global é aquela que preenche a tela.
     */
    window.canvas = getCanvas(innerWidth, innerHeight, true);

    /**
     * window.canvas = createElement(
     *     "canvas",
     *     {
     *         width: innerWidth,
     *         height: innerHeight,
     *         style: {
     *             width: innerWidth + "px",
     *             height: innerHeight + "px"
     *         }
     *     }
     * );
     */

    /**
     * O contexto é salvo para facilitar o acesso.
     */
    window.context = canvas.getContext("2d", { willReadFrequently: true });
    body.appendChild(canvas);
}

/**
 * Análise Sprite.
 * Essas funções lidam com o torneamento de library.rawsprites sequências de grafemas em library.sprites Uint8ClampedArrays.
 *     * Sprites normais (consulte library.js::libraryParse):
 *           spriteUnravel -> spriteExpand -> spriteGetArray.
 *
 *     * Sprites filtrados (consulte library.js::applyPaletteFilterRecursive):
 *           spriteUnravel -> applyPaletteFilter -> spriteExpand -> spriteGetArray.
 */

/**
 * Dada uma sequência de grafemas de dados de sprite complexos e compactada,
 * isso 'desvenda' (descompacta). Esta é a primeira função chamada em sequência
 * de grafemas em libraryParse. Isso pode gerar o Uint8ClampedArray
 * imediatamente se for dada a área - deliberadamente não, para
 * facilitar o armazenamento.
 */
function spriteUnravel(colors)
{
    var paletteref = getPaletteReferenceStarting(window.palette);
    var digitsize = window.digitsize;
    var clength = colors.length;
    var current;
    var rep;
    var nixloc;
    var newp;
    var i;
    var len;
    var output = "";
    var loc = 0;

    while (loc < clength)
    {
        switch (colors[loc])
        {
            /**
             * Um ciclo, ordenado como 'x char times ,'.
             */
            case 'x':
                /**
                 * Obter a localização da vírgula final.
                 */
                nixloc = colors.indexOf(",", ++loc);

                /**
                 * Obtenha a cor.
                 */
                current = makeDigit(paletteref[colors.slice(loc, loc += digitsize)], window.digitsize);

                /**
                 * Obtenha os tempos de repetição.
                 */
                rep = Number(colors.slice(loc, nixloc));

                /**
                 * Adicione esse int à saída, rep muitas vezes.
                 */
                while (rep--)
                {
                    output += current;
                }

                loc = nixloc + 1;
                break;

            /**
             * Um trocador de paleta, na forma 'p[X,Y,Z...]' (ou normalmente 'p').
             */
            case 'p':
                /**
                 * Se o próximo grafema for um '[', personalize.
                 */
                if (colors[++loc] == '[')
                {
                    nixloc = colors.indexOf(']');

                    /**
                     * Isole e faça a divisão dos números da nova paleta.
                     */
                    paletteref = getPaletteReference(colors.slice(loc + 1, nixloc).split(","));
                    loc = nixloc + 1;
                    digitsize = 1;
                } else
                {
                    /**
                     * Caso contrário, volte ao normal.
                     */

                    paletteref = getPaletteReference(window.palette);
                    digitsize = window.digitsize;
                }

                break;

            /**
             * Um número típico.
             */
            default:
                output += makeDigit(paletteref[colors.slice(loc, loc += digitsize)], window.digitsize);
                break;
        }
    }

    return output;
}

/**
 * Agora que o sprite está desvendado, expanda-o em escala (repita os grafemas).
 * A altura não é conhecida, então será criada durante o tempo de desenho.
 */
function spriteExpand(colors)
{
    var output = "";
    var clength = colors.length;
    var current;
    var i = 0;
    var j;

    /**
     * Para cada número,
     */
    while (i < clength)
    {
        current = colors.slice(i, i += digitsize);

        /**
         * Coloque-o na saída quantas vezes forem necessárias.
         */
        for (j = 0; j < scale; ++j)
        {
            output += current;
        }
    }

    return output;
}

/**
 * Dada a versão expandida das cores, imprima a matriz rgba.
 * Para fazer.
 */
function spriteGetArray(colors)
{
    var clength = colors.length;
    var numcolors = clength / digitsize;
    var split = colors.match(new RegExp('.{1,' + digitsize + '}', 'g'));
    var olength = numcolors * 4;
    var output = new Uint8ClampedArray(olength);
    var reference;
    var i;
    var j;
    var k;

    /**
     * console.log("spriteGetArray",colors);
     *
     * Para cada cor,
     */
    for (i = 0, j = 0; i < numcolors; ++i)
    {
        /**
         * Pegue seus ints RGBA.
         */
        reference = palette[Number(split[i])];

        /**
         * Coloque cada um na saída.
         */
        for (k = 0; k < 4; ++k)
        {
            output[j + k] = reference[k];
        }

        j += 4;
    }

    return output;
}

/**
 * Pesquisa de sprites.
 * Essas funções localizam um sprite em library.sprites e o analisam.
 */

/**
 * Passa por todos os movimentos de localização e análise do sprite de uma coisa.
 * Isso é chamado quando a aparência do sprite muda.
 */
function setThingSprite(thing)
{
    if (thing.hidden || !thing.title)
    {
        return;
    }

    /**
     * O cubo é primeiro verificado quanto a referências anteriores
     * ao mesmo className.
     */
    var cache = library.cache;
    var width = thing.spritewidth;
    var height = thing.spriteheight;
    var title = thing.title;
    var className = thing.className;

    /**
     * O primeiro será do tipo coisa (caráter, sólido...).
     */
    var classes = className.split(/\s+/g).slice(1).sort();

    /**
     * Exemplo: "Jogador jogador,correndo,pequeno,dois".
     */
    var key = title + " " + classes;

    var cached = cache[key];
    var sprite;

    /**
     * Se nenhum for encontrado, procure-o manualmente.
     */
    sprite = getSpriteFromLibrary(thing);

    if (!sprite)
    {
        log("Não foi possível obter sprite da biblioteca em " + thing.title);

        return;
    }

    if (sprite.multiple)
    {
        expandObtainedSpriteMultiple(sprite, thing, width, height);
        thing.sprite_type = sprite.type;
    } else
    {
        expandObtainedSprite(sprite, thing, width, height);
        thing.sprite_type = "normal";
    }
}

/**
 * Dada uma coisa, ela determinará qual sprite em library.sprites ela deve usar.
 * Isso é baseado em uma chave que usa a configuração, o título e as classes.
 */
function getSpriteFromLibrary(thing)
{
    var cache = library.cache;
    var title = thing.title;
    var libtype = thing.libtype;
    var className = thing.className;
    var classes = className.split(/\s+/g).slice(1).sort();
    var setting = (map.area || window.defaultsetting).setting.split(" ");
    var key;
    var cached;
    var sprite;
    var i;

    /**
     * Então ele sabe fazer isso normalmente, adicioná-los à frente.
     */
    for (i in setting)
    {
        classes.unshift(setting[i]);
    }

    /**
     * Exemplo: "Jogador jogador,correndo,pequeno,dois".
     */
    key = title + " " + classes;

    cached = cache[key],
    sprite;

    /**
     * Como não foi encontrado nenhum, procure-o manualmente.
     */
    if (!cached)
    {
        sprite = library.sprites[libtype][title];

        if (!sprite || !sprite.constructor)
        {
            console.log("Falha ao verificar sprite de " + title + ".");
            console.log("Title " + title, "\nLibtype " + libtype, "\n", thing, "\n");

            return;
        }

        /**
         * Se for mais complexo, procure por ele.
         */
        if (sprite.constructor != Uint8ClampedArray)
        {
            sprite = findSpriteInLibrary(thing, sprite, classes);
        }

        /**
         * Os dados simples foram encontrados, portanto, devem ser salvos.
         */
        cached = cache[key] = { raw: sprite };
    } else
    {
        sprite = cached.raw;
    }

    /**
     * O cubo complexo foi encontrado ou definido: agora para ajustar a inversão.
     * Para fazer: use as classes:
     *     .flip-horiz,
     *     .flip-vert.
     */
    switch (String(Number(classes.indexOf("flipped") >= 0)) + String(Number(classes.indexOf("flip-vert") >= 0)))
    {
        case "11":
            if (!cached["flipboth"])
            {
                sprite = cached["flipboth"] = flipSpriteArrayBoth(sprite);
            } else
            {
                sprite = cached["flipboth"];
            }

            break;

        case "10":
            if (!cached["fliphoriz"])
            {
                sprite = cached["fliphoriz"] = flipSpriteArrayHoriz(sprite, thing);
            } else
            {
                sprite = cached["fliphoriz"];
            }

            break;

        case "01":
            if (!cached["flipvert"])
            {
                sprite = cached["flipvert"] = flipSpriteArrayVert(sprite, thing);
            } else
            {
                sprite = cached["flipvert"];
            }

            break;

        default:
            sprite = cached.raw;
    }

    return sprite;
}

/**
 * O caso de uso típico: dado um sprite e thing+dimensions, expanda-o com
 * base na escala e grave-o no sprite.
 */
function expandObtainedSprite(sprite, thing, width, height, norefill)
{
    /**
     * Com as linhas definidas, repita-as por tamanho de unidade para
     * criar o produto final analisado.
     */
    var parsed = new Uint8ClampedArray(sprite.length * scale);
    var rowsize = width * unitsizet4;
    var heightscale = height * scale;
    var readloc = 0;
    var writeloc = 0;
    var si;
    var sj;

    /**
     * Para cada linha:
     */
    for (si = 0; si < heightscale; ++si)
    {
        /**
         * Adicione-o à escala x analisada.
         */
        for (sj = 0; sj < scale; ++sj)
        {
            /**
             * memcpyU8(sprite, parsed, readloc, writeloc, rowsize, thing);
             */
            memcpyU8(sprite, parsed, readloc, writeloc, rowsize);

            writeloc += rowsize;
        }

        readloc += rowsize;
    }

    /**
     * Se isso não fizer parte de um sprite múltiplo, grave o sprite
     * na tela da coisa.
     */
    if (!norefill)
    {
        thing.num_sprites = 1;
        thing.sprite = parsed;

        refillThingCanvas(thing);
    }

    return parsed;
}

/**
 * Um conjunto de vários sprites deve ser modificados individualmente.
 */
function expandObtainedSpriteMultiple(sprites, thing, width, height)
{
    /**
     * O sprite do meio (repetido) é usado normalmente.
     */
    var parsed = {};
    var sprite;
    var part;

    thing.num_sprites = 0;

    /**
     * Expanda cada vetor dos vários sprites para análise.
     */
    for (part in sprites)
    {
        /**
         * Se for uma matriz de sprites real, analise-a.
         */
        if ((sprite = sprites[part]).constructor == Uint8ClampedArray)
        {
            ++thing.num_sprites;
            parsed[part] = expandObtainedSprite(sprite, thing, width, height, true);
        } else if(typeof(sprite) == "number")
        {
            /**
             * Se for um número, multiplique-o pela escala.
             */
            parsed[part] = sprite * scale;
        } else
        {
            /**
             * Caso contrário, basta adicioná-lo.
             */
            parsed[part] = sprite;
        }
    }

    /**
     * Defina a tela da coisa (parsed.middle).
     */
    thing.sprite = parsed.middle;
    thing.sprites = parsed;
    refillThingCanvases(thing, parsed);
}

/**
 * Chamado quando getSpriteFromLibrary determinou que o cubo não contém a coisa.
 */
function findSpriteInLibrary(thing, current, classes)
{
    var nogood;
    var check;
    var i;
    var prev = current;

    /**
     * Se for um sprite múltiplo, retorne isso.
     */
    if (current.multiple)
    {
        return current;
    }

    /**
     * Questão: remoção desse no lançamento.
     */
    var loop_num = 0;

    /**
     * Caso contrário, continue procurando mais profundamente até que
     * uma sequência de grafemas ou SpriteMultiple seja encontrada.
     */
    while (nogood = true)
    {
        /**
         * Questão: remoção desse no lançamento.
         */
        if (++loop_num > 49)
        {
            alert(thing.title);
            console.log(thing.title, classes, current);
        }

        /**
         * Se uma das classes for uma camada mais baixa de current,
         * vá lá e remova a classe.
         */
        for (i in classes)
        {
            if (check = current[classes[i]])
            {
                current = check;
                classes.splice(i, 1);
                nogood = false;

                break;
            }
        }

        /**
         * Se nenhum corresponder, tente a especificação ('normal').
         */
        if (nogood)
        {
            if (check = current.normal)
            {
                nogood = false;

                switch (check.constructor)
                {
                    /**
                     * Se for um vetor de sprites, você o encontrou.
                     */
                    case Uint8ClampedArray:
                    case SpriteMultiple:
                        return check;

                    /**
                     * Se for um objeto, recurse normalmente.
                     */
                    case Object: 
                        current = check;
                        break;

                    default:
                        current = current[check];
                        break;
                }
            } else
            {
                nogood = true;
            }
        }

        /**
         * Verifique o tipo para ver o que fazer a seguir.
         */
        if (!nogood && current)
        {
            switch (current.constructor)
            {
                /**
                 * Você fez isso.
                 */
                case Uint8ClampedArray:
                case SpriteMultiple:
                    return current;

                /**
                 * Continue.
                 */
                case "Object": 
                    continue;
            }
        } else
        {
            console.log("\nSprite não encontrado! Título: " + thing.title);
            console.log("Classname:", thing.className);
            console.log("Restante", classes);
            console.log("Atual", current);
            console.log("Anterior", prev);

            return new Uint8ClampedArray(thing.spritewidth * thing.spriteheight);
        }
    }
}

/**
 * Desenho de pixels.
 * Com os sprites definidos, eles devem ser desenhados.
 */

/**
 * Desenha o sprite de uma coisa para sua tela.
 * Chamado quando um novo sprite é encontrado na biblioteca.
 * Para fazer: melhorias memcpyU8 ?
 */
function refillThingCanvas(thing)
{
    var canvas = thing.canvas;
    var context = thing.context;
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    memcpyU8(thing.sprite, imageData.data);
    context.putImageData(imageData, 0, 0);
}

/**
 * Como refillThingCanvas, mas para vários sprites.
 */
function refillThingCanvases(thing, parsed)
{
    var canvases = thing.canvases = {};
    var width = thing.spritewidthpixels;
    var height = thing.spriteheightpixels;
    var part;
    var imageData;
    var canvas;
    var context;
    var i;

    thing.num_sprites = 1;

    for (i in parsed)
    {
        /**
         * Se for um Uint8ClampedArray, analise-o em uma tela e adicione-o.
         */
        if ((part = parsed[i]) instanceof Uint8ClampedArray)
        {
            ++thing.num_sprites;

            /**
             * Cada tela tem um .canvas e um .context.
             */
            canvases[i] = canvas = { canvas: getCanvas(width, height) };
            canvas.context = context = canvas.canvas.getContext("2d", { willReadFrequently: true });
            imageData = context.getImageData(0, 0, width, height);
            memcpyU8(part, imageData.data);
            context.putImageData(imageData, 0, 0);
        } else
        {
            /**
             * Caso contrário, basta adicioná-lo normalmente.
             */

            canvases[i] = part;
        }
    }

    /**
     * Trate a tela do meio como normal.
     */
    canvas = canvases.middle;
    thing.canvas = canvas.canvas;
    thing.context = canvas.context;
}

/**
 * Isso é chamado de cada manutenção para reabastecer a tela principal.
 */
function refillCanvas()
{
    var canvas = window.canvas;
    var context = window.context;
    var things;
    var thing;
    var left;
    var top;
    var i;

    /**
     * Eu poderia implementar retângulos, mas por quê ? caso == caso médio...
     * context.clearRect(0, 0, canvas.width, canvas.height);
     */
    context.fillStyle = area.fillStyle;
    context.fillRect(0, 0, canvas.width, canvas.height);

    for (i = scenery.length - 1; i >= 0; --i)
    {
        drawThingOnCanvas(context, scenery[i]);
    }

    for (i = solids.length - 1; i >= 0; --i)
    {
        drawThingOnCanvas(context, solids[i]);
    }

    for (i = characters.length - 1; i >= 0; --i)
    {
        drawThingOnCanvas(context, characters[i]);
    }
}

/**
 * Função geral para desenhar uma coisa para um contexto.
 * Chama drawThingOnCanvas[Single/Multiple] com mais argumentos.
 */
function drawThingOnCanvas(context, me)
{
    if (me.hidden)
    {
        return;
    }

    var leftc = me.left;
    var topc = me.top;

    if (leftc > innerWidth)
    {
        return;
    }

    /**
     * Se houver apenas um sprite, é bem simples.
     * drawThingOnCanvasSingle(context, me.canvas, me, leftc, topc);
     */
    if (me.num_sprites == 1)
    {
        drawThingOnCanvasSingle(context, me.canvas, me, leftc, topc);
    } else
    {
        /**
         * Caso contrário, alguns cálculos serão necessários.
         */
        drawThingOnCanvasMultiple(context, me.canvases, me.canvas, me, leftc, topc);
    }
}

/**
 * Usado para a grande maioria dos sprites, onde apenas um sprite é desenhado.
 */
function drawThingOnCanvasSingle(context, canvas, me, leftc, topc)
{
    if (me.repeat)
    {
        drawPatternOnCanvas(context, canvas, leftc, topc, me.unitwidth, me.unitheight);
    } else
    {
        /**
         * else
         * {
         *     context.putImageData(
         *         me.context.getImageData(0, 0, me.spritewidthpixels, me.spriteheightpixels),
         *         leftc,
         *         topc
         *     );
         * }
         */

        context.drawImage(canvas, leftc, topc);
    }
}

/**
 * Não muito rapído; usado quando as coisas têm vários sprites.
 */
function drawThingOnCanvasMultiple(context, canvases, canvas, me, leftc, topc)
{
    var topreal = topc;
    var leftreal = leftc;
    var rightreal = me.right;
    var bottomreal = me.bottom;
    var widthreal = me.unitwidth;
    var heightreal = me.unitheight;
    var spritewidthpixels = me.spritewidthpixels;
    var spriteheightpixels = me.spriteheightpixels;
    var sdiff;
    var canvasref;

    /**
     * Sprites verticais podem ter 'top', 'bottom', 'middle'.
     */
    if (me.sprite_type[0] == 'v')
    {
        /**
         * Se houver um fundo, desenhe-o e empurre o bottomreal para cima.
         */
        if (canvasref = canvases.bottom)
        {
            sdiff = canvases.bottomheight || me.spriteheightpixels;
            drawPatternOnCanvas(context, canvasref.canvas, leftreal, bottomreal - sdiff, spritewidthpixels, min(heightreal, spriteheightpixels));
            bottomreal -= sdiff;
            heightreal -= sdiff;
        }

        /**
         * If there's a top, draw that and push down topreal.
         */
        if (canvasref = canvases.top)
        {
            sdiff = canvases.topheight || me.spriteheightpixels;
            drawPatternOnCanvas(context, canvasref.canvas, leftreal, topreal, spritewidthpixels, min(heightreal, spriteheightpixels));
            topreal += sdiff;
            heightreal -= sdiff;
        }
    } else if(me.sprite_type[0] == 'h')
    {
        /**
         * Sprites horizontais podem ter 'left', 'right', 'middle'.
         */

        /**
         * Se houver uma esquerda, desenhe-a e empurre a esquerda real.
         */
        if (canvasref = canvases.left)
        {
            sdiff = canvases.leftwidth || me.spritewidthpixels;
            drawPatternOnCanvas(context, canvasref.canvas, leftreal, topreal, min(widthreal, spritewidthpixels), spriteheightpixels);
            leftreal += sdiff;
            widthreal -= sdiff;
        }

        /**
         * Se houver um direito, desenhe-o e empurre de volta o direito real.
         */
        if (canvasref = canvases.right)
        {
            sdiff = canvases.rightwidth || me.spritewidthpixels;
            drawPatternOnCanvas(context, canvasref.canvas, rightreal - sdiff, topreal, min(widthreal, spritewidthpixels), spriteheightpixels);
            rightreal -= sdiff;
            widthreal -= sdiff;
        }
    }

    /**
     * Se ainda houver espaço, desenhe a tela real.
     */
    if (topreal < bottomreal && leftreal < rightreal)
    {
        drawPatternOnCanvas(context, canvas, leftreal, topreal, widthreal, heightreal);
    }
}

/**
 * Ajudantes.
 */

/**
 * Dada uma sequência de grafemas de uma paleta, isso retorna o
 * objeto de paleta real.
 */
function getPaletteReferenceStarting(palette)
{
    var output = {};

    for (var i = 0; i < palette.length; ++i)
    {
        output[makeDigit(i, digitsize)] = makeDigit(i, digitsize);
    }

    return output;
}

/**
 * Dada uma nova sequência de grafemas de paleta, cria um novo
 * objeto de paleta ? Não tenho certeza.
 */
function getPaletteReference(palette)
{
    var output = {};
    var digitsize = getDigitSize(palette);

    for (var i = 0; i < palette.length; ++i)
    {
        output[makeDigit(i, digitsize)] = makeDigit(palette[i], digitsize);
    }

    return output;
}

/**
 * Inverter horizontalmente é inverter os pixels dentro de cada linha.
 */
function flipSpriteArrayHoriz(sprite, thing)
{
    var length = sprite.length;
    var width = thing.spritewidth;
    var height = thing.spriteheight;
    var newsprite = new Uint8ClampedArray(length);
    var rowsize = width * unitsizet4;
    var newloc;
    var oldloc;
    var i;
    var j;
    var k;

    /**
     * Para cada linha.
     */
    for (i = 0; i < length; i += rowsize)
    {
        newloc = i;
        oldloc = i + rowsize - 4;

        /**
         * Para cada pixel.
         */
        for (j = 0; j < rowsize; j += 4)
        {
            for (k = 0; k < 4; ++k)
            {
                newsprite[newloc + k] = sprite[oldloc + k];
            }

            newloc += 4;
            oldloc -= 4;
        }
    }

    return newsprite;
}

/**
 * Inverter verticalmente é inverter a ordem das linhas.
 */
function flipSpriteArrayVert(sprite, thing)
{
    var length = sprite.length;
    var width = thing.spritewidth;
    var height = thing.spriteheight;
    var newsprite = new Uint8ClampedArray(length);
    var rowsize = width * unitsizet4;
    var newloc = 0;
    var oldloc = length - rowsize;
    var i;
    var j;
    var k;

    /**
     * Para cada linha.
     */
    while (newloc < length)
    {
        /**
         * Para cada pixel nas linhas.
         */
        for (i = 0; i < rowsize; i += 4)
        {
            /**
             * Para cada valor rgba.
             */
            for (j = 0; j < 4; ++j)
            {
                newsprite[newloc + i + j] = sprite[oldloc + i + j];
            }
        }

        newloc += rowsize;
        oldloc -= rowsize;
    }

    return newsprite;
}

/**
 * Inverter horizontalmente e verticalmente é, na verdade, apenas
 * inverter a ordem dos pixels.
 */
function flipSpriteArrayBoth(sprite)
{
    var length = sprite.length;
    var newsprite = new Uint8ClampedArray(length);
    var oldloc = sprite.length - 4;
    var newloc = 0;
    var i;

    while (newloc < length)
    {
        for (i = 0; i < 4; ++i)
        {
            newsprite[newloc + i] = sprite[oldloc + i];
        }

        newloc += 4;
        oldloc -= 4;
    }

    return newsprite;
}

/**
 * Por causa da frequência com que é usado pelas funções de desenho
 * regulares. Não sou fã dessa falta de controle sobre as coordenadas
 * de origem da especificação.
 */
function drawPatternOnCanvas(context, source, leftc, topc, unitwidth, unitheight)
{
    context.translate(leftc, topc);
    context.fillStyle = context.createPattern(source, "repeat");
    context.fillRect(0, 0, unitwidth, unitheight);
    context.translate(-leftc, -topc);
}

/**
 * Força cada coisa a se redesenhar.
 */
function clearAllSprites(clearcache)
{
    var arrs = [
        window.solids,
        window.characters,
        window.scenery
    ];

    var arr;
    var i;

    for (arr in arrs)
    {
        for (i in (arr = arrs[arr]))
        {
            setThingSprite(arr[i]);
        }
    }

    if (clearcache)
    {
        library.cache = {};
    }
}

/**
 * function memcpyU8(source, destination, readloc, writeloc, length)
 * {
 *     if (readloc == null)
 *     {
 *         readloc = 0;
 *     }
 *
 *     if (length == null)
 *     {
 *         length = source.length - readloc;
 *     }
 *
 *     destination.set(source.subarray(readloc || 0, length), writeloc || 0);
 * }
 */

/**
 * function memcpyU8(source, destination, readloc, writeloc, writelength, thing).
 */
function memcpyU8(source, destination, readloc, writeloc, writelength)
{
    if (!source || !destination || readloc < 0 || writeloc < 0 || writelength <= 0)
    {
        return;
    }

    if (readloc >= source.length || writeloc >= destination.length)
    {
        /**
         * console.log("Alert: memcpyU8 requested out of bounds!");
         * console.log("source, destination, readloc, writeloc, writelength, thing");
         * console.log(arguments);
         */

        return;
    }

    if (readloc == null)
    {
        readloc = 0;
    }

    if (writeloc == null)
    {
        writeloc = 0;
    }

    if (writelength == null)
    {
        writelength = max(0, min(source.length, destination.length));
    }

    /**
     * Permitir otimização de inteiro JIT (o Firefox usa disso).
     */
    var lwritelength = writelength + 0;

    var lwriteloc = writeloc + 0;
    var lreadloc = readloc + 0;

    /**
     * while(--lwritelength).
     */
    while (lwritelength--)
    {
        destination[lwriteloc++] = source[lreadloc++];
    }
}

/**
 * Uma maneira um tanto multiplataforma de tornar o contexto 2D
 * de uma tela não pixels suaves.
 */
function canvasDisableSmoothing(canvas, context)
{
    context = context || canvas.getContext("2d", { willReadFrequently: true });

    context.webkitImageSmoothingEnabled = false;
    context.mozImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
}
