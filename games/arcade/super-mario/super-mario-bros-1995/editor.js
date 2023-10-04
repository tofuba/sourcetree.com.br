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
 * Editor.js.
 *
 * Contém todas as funções necessárias para carregar e usar
 * o editor. Fornece uma IU para selecionar Coisas e suas
 * opções. Quando terminar, faz o mapa com base no que
 * ainda está colocado.
 */

/**
 * Coisas para fazer:
 * Adicione plataformas de volta (e algumas outras coisas
 * que faltam). Dê opções para diferentes áreas.
 */

/**
 *
 */
function loadEditor(noreset)
{
    /**
     * Verifique se não há outras instâncias disso.
     */
    editorClose();

    /**
     * Se você quiser limpar o mapa atual.
     */
    if (!noreset)
    {
        window.canedit = true;
        setMap(["Special", "Blank"]);
        window.canedit = false;
    }

    /**
     * Defina a biblioteca e os controles.
     */
    setEditorLibrary();
    setEditorHTML();
    setEditorControls();
    setEditorTriggers();
    setEditorLocalRetrieval();

    /**
     * Atualização visual.
     */
    classAdd(body, "editor");
    classAdd(editor.sidebar, "expanded");
    TimeHandler.addEvent(classRemove, 35, editor.sidebar, "expanded");

    /**
     * Deixe o resto do jogo saber o que está acontecendo.
     */
    map.shifting = false;
    window.editing = true;
}

/**
 * Para fazer: Mescle isso na biblioteca principal e faça
 * o Things.js usá-lo para inicializadores.
 */
function setEditorLibrary()
{
    /**
     * O editor contém os sólidos e grafemas que podem ser colocados.
     */
    window.editor = {
        xloc: 0,
        yloc: 0,
        playing: false,
        canplace: true,

        /**
         * max é definido durante o procedimento, se realmente necessário.
         */
        offset: {
            x: unitsizet2
        },

        settings: {
            night: false,
            setting: "Overworld",
            alt: false
        },

        defaults: {
            width: 8,
            height: 8,
            widthoff: 0,
            heightoff: 0,
            minimum: 1,
            followerUpdate: editorFollowerUpdateStandard,
            prefunc: pushPreThing,
            outerok: true
        },

        placed: [],
        characters: {
            Goomba: {},
            Koopa: {
                height: 12,
                arguments: {
                    smart: Boolean,
                    movement: [
                        "moveSimple",
                        "moveJumping",
                        "moveFloating"
                    ]
                },

                followerUpdate: function(reference, pairs)
                {
                    var smart = pairs.smart == "True";
                    var fname = pairs.movement;
                    var func = fname == "moveJumping";

                    if (fname == "moveFloating")
                    {
                        func = [8, 72];
                    }

                    return [smart, func];
                },

                onadds: {
                    nocollide: false
                }
            },

            Beetle: {
                width: 8.5,
                height: 8.5
            },

            HammerBro: {
                height: 12
            },

            CheepCheep: {
                arguments: {
                    smart: Boolean
                },

                attributes: {
                    nofall: true
                }
            },

            Lakitu: {
                height: 12
            },

            Podoboo: {
                width: 7
            },

            Blooper: {
                height: 12,

                onadds: {
                    nofall: true
                }
            },

            Bowser: {
                width: 16,
                height: 16
            }
        },

        solids: {
            Floor: { 
                arguments: {
                    width: 8
                },

                mydefaults: {
                    width: 8
                },

                prefunc_custom: function(prestatement, placer, reference, args)
                {
                    var output = "Floor, " + prestatement.xloc + ", " + (prestatement.yloc);

                    if (args[1])
                    {
                        output += ", " + args[1];
                    }

                    return output;
                }
            },

            Brick: {
                arguments: {
                    contents: [
                        "false",
                        "Coins",
                        "Star"
                    ]
                },

                followerUpdate: function(reference, pairs)
                {
                    var output = [];
                    var content = pairs.contents;

                    output.push(window[pairs.contents]);

                    return output;
                },

                prefunc_custom: function(prestatement, placer, reference, args)
                {
                    var output = "Brick, ";

                    output += prestatement.xloc + ", " + (prestatement.yloc);

                    if (placer.contents)
                    {
                        output += ", " + placer.contents[0].name;
                    }

                    return output;
                }
            },

            Block: {
                arguments: {
                    contents: [
                        "Coin",
                        "Mushroom",
                        "Star",
                        "1Up Mushroom"
                    ],

                    hidden: Boolean
                },

                followerUpdate: function(reference, pairs)
                {
                    var output = [];
                    var content = pairs.contents;

                    if (content == "1Up Mushroom")
                    {
                        output.push([Mushroom, 1]);
                    } else
                    {
                        output.push(window[pairs.contents]);
                    }

                    if (pairs.hidden == "True")
                    {
                        TimeHandler.addEvent(function()
                        {
                            editor.follower.hidden = true;
                        });

                        output.push(1);
                    }

                    return output;
                },

                prefunc_custom: function(prestatement, placer, reference, args)
                {
                    var output = "Block, ";
                    var contents = placer.contents;
                    var contained = contents[0].name;

                    output += prestatement.xloc + ", " + prestatement.yloc;

                    /**
                     * Se tiver conteúdos incomuns, marque-os
                     */
                    if (contained != "Coin")
                    {
                        /**
                         * O conteúdo geralmente é apenas o nome da função (normalmente são moedas),
                         * com exceção dos cogumelos 1Up e Death.
                         */
                        if (contained == "Mushroom" && contents[1])
                        {
                            output += ", [Mushroom, " + String(contents[1]) + "]";
                        } else
                        {
                            output += ", " + contained;
                        }

                        /**
                         * Hidden é simplesmente um bool.
                         */
                        if (placer.hidden)
                        {
                            output += ", true";
                        }
                    } else if (placer.hidden)
                    {
                        /**
                         * Caso contrário, adicione apenas mais se estiver oculto.
                         */
                        output += ", false, true";
                    }

                    return output;
                }
            },

            Cannon: {
                arguments: {
                    height: 8
                },

                sprite_source: "top"
            },

            Pipe: {
                width: 16,
                prefunc: pushPrePipe,
                prefunc_solo: true,

                arguments: {
                    height: 8,
                    Pirhana: Boolean
                },

                followerUpdate: function(reference, pairs)
                {
                    var output = [];

                    output.push(Number(pairs.height));
                    output.push(Boolean(pairs.Pirhana));

                    return output;
                },

                sprite_source: "top"
            },

            Stone: {
                arguments: {
                    width: 8,
                    height: 8
                },

                prefunc_custom: function(prestatement, placer, reference, args)
                {
                    var output = "Stone, " + prestatement.xloc + ", " + (prestatement.yloc);
                        output += ", " + args[1] + ", " + args[2];

                    return output;
                }
            },

            Coral: {
                arguments: {
                    height: 8
                }
            },

            CastleBlock: {
                arguments: {
                    fireballs: 2,

                    direction: [
                        "CW",
                        "CCW"
                    ],

                    hidden: Boolean
                },

                followerUpdate: function(reference, pairs)
                {
                    var length = Number(pairs.fireballs);
                    var dt = pairs.direction == "CW";
                    var hidden = pairs.hidden == "True";

                    return [[length, dt], hidden];
                }
            },

            /**
             * Desativado por causa de super falhas, mas eu realmente
             * quero colocá-lo de volta.
             */

            /**
             * Platform: {
             *     height: 4,
             *
             *     arguments: {
             *         width: 2,
             *         movement: [
             *             "false",
             *             "Falling",
             *             "Floating",
             *             "Sliding",
             *             "Transport"
             *         ]
             *     },
             *
             *     mydefaults: {
             *         width: 4
             *     },
             *
             *     previewsize: true,
             *
             *     followerUpdate: function(reference, pairs)
             *     {
             *         var output = [];
             *         var movement = pairs.movement;
             *         output.push(pairs.width);
             *
             *         switch (movement)
             *         {
             *             case "Falling":
             *                 output.push(moveFalling);
             *                 break;
             *
             *             case "Floating":
             *                 output.push(moveFloating);
             *                 break;
             *
             *             case "Sliding":
             *                 output.push(moveSliding);
             *                 break;
             *
             *             case "Transport":
             *                 output.push(collideTransport);
             *                 break;
             *         }
             *
             *         return output;
             *     },
             *
             *     prefunc_custom: function(prestatement, placer, reference, args)
             *     {
             *         var output = "Platform, " + prestatement.xloc + ", " + (prestatement.yloc);
             *         var movement = args[2];
             *
             *         switch (movement)
             *         {
             *             case moveFalling:
             *                 output += ", moveFalling";
             *                 break;
             *
             *             case moveFloating:
             *                 output += ", [moveFloating, 8, 72]";
             *                 break;
             *
             *             case moveSliding:
             *                 var xloc = prestatement.xloc || 0;
             *
             *                 output += ", [moveSliding";
             *                 output += ", " + (xloc - 24);
             *                 output += ", " + (xloc + 24);
             *                 output += "]";
             *                 break;
             *
             *             case collideTransport:
             *                 output += ", collideTransport";
             *                 break;
             *         }
             *
             *         return output;
             *     }
             * },
             */

            Springboard: {
                height: 14.5,
                heightoff: 1.5
            }
        },

        scenery: {
            Bush1: {
                width: 16
            },

            Bush2: {
                width: 24
            },

            Bush3: {
                width: 32
            },

            Cloud1: {
                width: 16,
                height: 12
            },

            Cloud2: {
                width: 24,
                height: 12
            },

            Cloud3: {
                width: 32,
                height: 12
            },

            HillSmall: {
                width: 24,
                height: 9.5,
                heightoff: -1.5
            },

            HillLarge: {
                width: 40,
                height: 17.5,
                heightoff: -1.5
            },

            PlantSmall: {
                width: 7,
                height: 15,
                heightoff: 1
            },

            PlantLarge: {
                height: 23,
                heightoff: 1
            },

            Fence: {},
            Water: {
                width: 4,
                height: 4,
                prefunc: fillPreWater,
                prefunc_solo: true,

                prefunc_custom: function(prestatement, placer, reference, args)
                {
                    /**
                     * return prestatement.xloc + ", " + (prestatement.yloc) + ", " + args[0];
                     */
                    return prestatement.xloc + ", " + (prestatement.yloc);
                }
            }
        }
    };

    /**
     * As propriedades obrigatórias não preenchidas são colocadas aqui.
     */
    var load_paths = {};
    var defaults = editor.defaults;
    var group;
    var me;
    var locj;
    var i;
    var j;

    /**
     * Para cada grupo no editor...
     */
    for (i in editor)
    {
        group = editor[i];

        /**
         * Para cada coisa nesse grupo...
         */
        for (j in editor[i])
        {
            me = group[j];

            /**
             * Prolifere as especificações que não existem.
             */
            proliferate(me, editor.defaults, true);
        }
    }

    /**
     * Observe que tudo no cenário é, na verdade, pushPreScenery(name, ...).
     */
    group = editor.scenery;

    for (i in group)
    {
        me = group[i];

        /**
         * Esses são as especificações secundárias.
         */
        proliferate(me, {
            createfunc: function(me)
            {
                return ThingCreate(Sprite, me.spritename);
            },

            spritename: i,
            prefunc_custom: function(prestatement, placer, reference, args)
            {
                return "'" + reference.spritename + "', " + prestatement.xloc + ", " + (prestatement.yloc - reference.height);
            }
        }, true);

        /**
         * Estes devem acontecer.
         */
        if (me.prefunc == pushPreThing)
        {
            me.prefunc = pushPreScenery;
        }
    }
}

/**
 * Configuração inicial do HTML.
 */
function setEditorHTML()
{
    createEditorGuideLines();
    createEditorSidebar();
    createEditorBottomBar();
    createEditorScrollers();

    /**
     * Defina a barra inferior inicialmente.
     */
    editor.sectionselect.onchange();
}

/**
 * A barra lateral contém as principais opções para colocar coisas.
 */
function createEditorSidebar()
{
    var optionNames = [
        "Solids",
        "Characters",
        "Scenery",
        "Settings"
    ];

    /**
     * Os principais elementos.
     */
    var  sidebar = editor.sidebar = createElement("div", {
        id: "sidebar"
    });

    var category = editor.category = createElement("div", {
        id: "category",
        className: "group first"
    });

    var sectionselect = editor.sectionselect = createElement("select", {
        id: "sectionselect",
        className: "options big",
        onchange: editorSelectSection
    });

    var options = editor.options = createElement("div", {
        id: "options",
        className: "options big"
    });

    var i;

    /**
     * Estrutura do elemento de dados.
     */
    sidebar.appendChild(category);
    category.appendChild(sectionselect);

    for (i in optionNames)
    {
        sectionselect.appendChild(
            createElement("option", {
                innerText: optionNames[i]
            })
        );
    }

    sidebar.appendChild(options);

    /**
     * Com ele inicialmente definido, adicione a barra lateral.
     */
    body.appendChild(window.sidebar = sidebar);
}

/**
 * Permite que a pessoa escolha qual Coisa colocar.
 */
function createEditorBottomBar()
{
    var bar = editor.bottombar = createElement("div", {
        id: "bottombar",
        things: {}
    });

    sidebar.appendChild(bar);
}

/**
 *
 */
function createEditorScrollers()
{
    var names = ["right", "left"];
    var scrollers = {};
    var name;
    var i;
    var parent;
    var div;
    var top;

    /**
     * Defina os #scrollers principais para mantê-los.
     */
    parent = createElement("div", {
        id: "scrollers",
        style: {
            zIndex: 7,
            width: (innerWidth - 32) + "px"
        }
    });

    /**
     * Crie os dois scrollers.
     */
    settings = {
        className: "scroller",

        style: {
            zIndex: 7,
            marginTop: innerHeight / 2 + "px"
        },

        onmouseover: editorFollowerHide,
        onmouseout: editorFollowerShow,
        onmousedown: editorScrollingStart,
        onmouseup: editorScrollingStop
    };

    /**
     * Crie cada div.
     */
    for (i = names.length - 1; i >= 0; --i)
    {
        name = names[i];
        div = scrollers[names[i]] = createElement("div", settings);
        parent.appendChild(div);
    }

    /**
     * O esquerdo deve começar escondido.
     */
    proliferate(scrollers["left"], {
        id: "left",
        className: "scroller flipped off",
        dx: -7
    });

    /**
     * O da direita está à direita da tela.
     */
    proliferate(scrollers["right"], {
        id: "right",
        style: {
            right: "21px"
        },

        dx: 7
    });

    editor.scrollers = scrollers;
    body.appendChild(parent);
}

/**
 *
 */
function editorFollowerHide()
{
    var follower = editor.follower;
        follower.hiddenOld = follower.hidden;
        follower.hidden = true;
}

/**
 *
 */
function editorFollowerShow()
{
    var follower = editor.follower;
        follower.hidden = follower.hiddenOld;
}

/**
 *
 */
function editorScrollingStart(event)
{
    var scroller = event.target;
    var dx = scroller.dx;

    editorPreventClicks();
    editor.scrolling = TimeHandler.addEventInterval(editorScrolling, 1, Infinity, -dx);
    classRemove(editor.scrollers["left"], "off");
}

/**
 *
 */
function editorScrollingStop()
{
    TimeHandler.addEvent(editorClickOff, 3);
    TimeHandler.clearEvent(editor.scrolling);
}

/**
 *
 */
function editorScrolling(dx)
{
    scrollEditor(dx);

    if (editor.xloc >= 0)
    {
        scrollEditor(-editor.xloc);
        editorScrollingStop();
        classAdd(editor.scrollers["left"], "off");

        return true;
    }
}

/**
 * As diretrizes exibem limites úteis.
 */
function createEditorGuideLines()
{
    var lines = {
        floor: 0,
        ceiling: ceillev,
        jumplev1: jumplev1,
        jumplev2: jumplev2
    };

    var left = 16 * unitsize + "px";
    var floor = map.floor;
    var i;
    var parent;
    var line;

    /**
     * A camada mais alta mantém e fornece o marginLeft.
     */
    window.maplines = parent = document.createElement("div");
    parent.style.marginLeft = left;
    parent.id = "maplines";

    /**
     * Crie cada linha e coloque-a na camada mais alta.
     */
    for (i in lines)
    {
        line = createElement("div", {
            innerText: i,
            className: "mapline",
            id: i + "_line",

            style: {
                marginTop: (floor - lines[i]) * unitsize + "px",
                marginLeft: "-" + left,
                paddingLeft: left
            }
        });

        parent.appendChild(line);
    }

    body.appendChild(parent);
}

/**
 * Os controles fornecem procedimentos típicos como desfazer e salvar.
 */
function setEditorControls(names)
{
    /**
     * [..., "erase"]
     */
    names = names || [
        "load",
        "save",
        "reset",
        "undo"
    ];

    var previous = document.getElementById("controls");
    var container = createElement("div", {id: "controls"});
    var controls = editor.controls = {container: container};
    var name;
    var div;
    var i;

    /**
     * Limpe qualquer coisa previamente existente.
     */
    if (previous)
    {
        previous.innerHTML = "";
    }

    /**
     * Para cada nome, adicione um div.
     */
    for (i in names)
    {
        name = names[i];

        div = createElement("div", {
            id: name,
            alt: name,
            className: "control",
            style: { backgroundImage: "url(./Theme/" + name + ".gif)" },
            innerHTML: "<div class='controltext'>" + name + "</div>",
            onclick: editorClickControl
        });

        container.appendChild(div);
        controls[name] = div;
    }

    sidebar.appendChild(container);
}

/**
 * O que acontece quando o mouse é pressionado/clique/etc.
 */
function setEditorTriggers()
{
    /**
     * Tudo o que permite acionamentos do mouse.
     */
    var activators = [maplines, canvas];
    var me;
    var i;

    for (i = activators.length - 1; i >= 0; --i)
    {
        me = activators[i];
        me.onclick = editorMouseClick;
    }

    /**
     * Certifique-se de que a posição do seguidor está atualizada.
     */
    document.onmousemove = editorFollowerFollowsCursor;
}

/**
 * Coloque uma coisa nova no local do editor.
 */
function editorMouseClick(event)
{
    if (!window.editing || editor.clicking)
    {
        return;
    }

    editorPreventClicks();

    /**
     * Se estiver apagando, faça isso.
     */
    if (editor.erasing)
    {
        return editorPlaceEraser(event);
    }

    /**
     * Não faça nada se estiver nas configurações ou apenas
     * clicar em um controle.
     */
    if (editor.in_settings || !editor.canplace)
    {
        return;
    }

    var section_name = editor.section_name;
    var current_section = window[section_name];
    var thing_name = editor.current_selected;
    var follower_old = editor.follower;

    /**
     * Grave este último seguidor em editor.placed.
     */
    editor.placed.push(follower_old);

    /**
     * Para visualizar, basta desanexar o seguidor do editor e
     * criar um novo.
     */
    editor.follower = false;
    editorSetCurrentThingFromName(null, true);

    /**
     * (quando pausado, isso não acontece de outra forma).
     */
    if (paused)
    {
        refillCanvas();
    }

    /**
     * Não é necessária mais modificação de seguidores, porque cada
     * coisa armazena seus próprios argumentos. Possibilitando .was_follower
     * permite que a eventual função salvar saiba que esta é uma coisa chave.
     */
    follower_old.was_follower = true;
    delete follower_old.onclick;

    /**
     * Se for uma corrida 'ao vivo', ative as coisas de velocidade e movimento.
     */
    if (editor.playing)
    {
        thingRetrieveVelocity(follower_old);
        proliferate(follower_old, follower_old.reference.attributes);
    }
}

/**
 * Seleciona sólidos ou grafemas ou etc.
 */
function editorSelectSection()
{
    var selected = (this || editor.sectionselect).value.toLowerCase();

    /**
     * Limpar e carregar a barra inferior.
     * Se for configurações, faça alguma coisa.
     */
    if (editor.in_settings = selected == "settings")
    {
        editorSetSection(selected, true);
        editorSetSectionSettings();
    } else
    {
        editorSetSection(selected);
    }
}

/**
 *
 */
function editorSetSection(name, nothing)
{
    var section = editor.section = editor[name];
    var bottombar = editor.bottombar;
    var num_kids = 0;
    var canv_sel;
    var canv;
    var first;
    var name;

    editor.section_name = name;

    /**
     * Limpar e redefinir a barra inferior.
     */
    bottombar.innerHTML = "";

    if (!nothing)
    {
        for (name in section)
        {
            ++num_kids;
            canv = editorAddBottomPreview(bottombar, name, section[name]);

            if (!canv_sel)
            {
                /**
                 * Isso faz com que ele pegue a primeira tela (comente
                 * para pegar a última).
                 */
                canv_sel = canv;
            }
        }
    }

    /**
     * Mostre a barra inferior apenas se não houver configurações.
     */
    if (num_kids)
    {
        bottombar.style.visibility = "visible";
        editorSetCurrentThingFromCanvas(canv_sel);
    } else
    {
        bottombar.style.visibility = "hidden";
    }
}

/**
 * Adiciona um objeto equivalente à barra inferior.
 */
function editorAddBottomPreview(bottombar, name, ref)
{
    /**
     * Crie uma tela baseada em nome e ref.
     */
    var width = ref.width;
    var height = ref.height;
    var thingfunc = window[name];

    /**
     * A coisa é usada para desenho de imagens.
     * Se o nome não existir como membro da janela, é um sprite de cenário.
     */
    var thing = thingfunc ? ThingCreate(thingfunc, ref.previewargs) : new Thing(Sprite, name);

    /**
     * O titular segura a tela por motivos de posicionamento.
     */
    var holder = createElement("div", {
        width: width * unitsize + "px",
        height: height * unitsize + "px",
        name: name,
        className: "holder " + name,
        onclick: editorSetCurrentThing
    });

    var maxWidth = {
        maxWidth: "100%"
    };

    var maxHeight = {
        maxHeight: "100%"
    };

    var canvas = proliferate(getCanvas(width * unitsizet2, height * unitsizet2), {
        name: name,
        reference: ref,
        style: { marginLeft: -roundDigit(width / 2, scale) + "px" },
        onclick: editorSetCurrentThing
    });

    var things = bottombar.things;
    var sizewidth = width * unitsizet2;
    var sizeheight = height * unitsizet2;
    var context = canvas.getContext("2d", { willReadFrequently: true });
    var csource;

    /**
     * Para nitidez mais alta.
     */
    canvasDisableSmoothing(canvas);

    /**
     * Atualize-o visualmente.
     */
    editor.bottombar.things[name] = canvas.thing = thing;

    /**
     * Aqueles que precisam saber que isso é diferente obtê-lo aqui.
     */
    addClass(thing, "editor");

    /**
     * Saiba de onde tirar (vários sprites precisam ser especificados).
     */
    csource = thing.canvas;

    if (thing.canvases)
    {
        csource = thing.canvases[ref.sprite_source || "middle"].canvas;
    }

    /**
     * Se houver um tamanho de visualização, padronize-o na tela.
     */
    if (ref.previewsize)
    {
        context.fillStyle = context.createPattern(csource, "repeat");
        context.fillRect(0, 0, sizewidth, sizeheight);
    } else
    {
        /**
         * Caso contrário, desenhe normalmente...
         */

        context.drawImage(csource, 0, 0, sizewidth, sizeheight);
    }

    /**
     * Adicione a tela ao suporte, que é adicionado à barra inferior.
     */
    holder.appendChild(holder.canvas = canvas);
    bottombar.appendChild(holder);
    bottombar[name] = holder;

    /**
     * Retorne a tela (a última será definida como a atual).
     */
    return canvas;
}

/**
 * Exibe as configurações do editor em vez dos argumentos do Thing.
 */
function editorSetSectionSettings()
{
    var settings = editor.settings;
    var html = "<table>";
    var rows;

    html += "<h3 class='title'>Configurações</h3>";

    /**
     * Adicione as opções, algumas das quais não são comum.
     */
    html += addArgumentOption("night", Boolean, settings.night);
    html += addArgumentOption("setting", ["Overworld", "Underworld", "Underwater", "Castle", "Sky"], settings.setting);
    html += addArgumentOption("alt", Boolean, settings.alt);
    html += "</table>";

    /**
     * Aplicar isso às opções.
     */
    options.innerHTML = html;

    /**
     * Torne-os válidos e chame a função de atualização de
     * configuração.
     */
    ensureOptionsAboveZero(editorUpdateSettingsOption);

    /**
     * Conhecendo essas opções, faça referência a elas.
     */
    rows = editor.sidebar.getElementsByTagName("table")[0].rows;
    editor.settings.night_elem = rows[0].cells[1].firstChild;
    editor.settings.setting_elem = rows[1].cells[1].firstChild;
    editor.settings.alt_elem = rows[2].cells[1].firstChild;

    /**
     * Não há nenhum seguidor aqui.
     */
    if (editor.follower)
    {
        killNormal(editor.follower);
    }

    editor.follower = false;
}

/**
 * Chamado em vez de editorUpdateFollower para configurações.
 */
function editorUpdateSettingsOption(event)
{
    var settings = editor.settings;
    var night = settings.night = settings.night_elem.value == "True";
    var alt = settings.alt = settings.alt_elem.value == "True";
    var setting = settings.setting = settings.setting_elem.value;

    /**
     * Obtenha a nova configuração de área nos elementos de
     * configurações do editor.
     */
    var newsetting = setting + (night ? " Night" : "") + (alt ? " " + alt : "");

    setAreaSetting(area, newsetting, newsetting != area.setting);
}

/**
 * Chamado quando algo na barra inferior é clicado.
 */
function editorSetCurrentThing(event, sameargs)
{
    /**
     * Defina isso como selecionado para o editor.
     */
    var self = event.target;
    var name = editor.current_thing_name = self.name;
    var refs = editor.current_thing = editor.section[name];

    if (!sameargs)
    {
        updateCurrentArguments(name, refs);
    }

    editorUpdateFollower();
}

/**
 * Cria manualmente um evento falso para editorSetCurrentThing
 * usando a tela da barra inferior.
 */
function editorSetCurrentThingFromCanvas(canv, sameargs)
{
    editorSetCurrentThing({target: canv}, sameargs);
}

/**
 * Cria manualmente um evento falso para editorSetCurrentThing usando apenas um nome.
 */
function editorSetCurrentThingFromName(name, sameargs)
{
    editorSetCurrentThing({target: {name: name || editor.current_thing_name}}, sameargs);
}

/**
 * Exibe os argumentos da Coisa selecionada.
 */
function updateCurrentArguments(name, reference)
{
    reference = reference || {};

    var options = editor.options;
    var html = "<table>";
    var mydefaults = reference.mydefaults || {};
    var arguments = reference.arguments || {};
    var i;

    /**
     * Adicione o nome desta coisa.
     */
    html += "<h3 class='title'>" + name + "</h3>";

    /**
     * O tamanho deve estar lá, com ou sem os argumentos.
     */

    if (!arguments.width)
    {
        html += addStaticOption("width", reference.width);
    }

    if (!arguments.height)
    {
        html += addStaticOption("height", reference.height);
    }

    /**
     * Adicione quaisquer outros argumentos.
     */
    for (i in arguments)
    {
        html += addArgumentOption(i.replace("_", "-"), arguments[i], null, mydefaults);
    }

    /**
     * Envie o HTML.
     */
    html += "</table>";
    options.innerHTML = html;

    ensureOptionsAboveZero();
}

/**
 * Uma opção que não pode ser alterada.
 */
function addStaticOption(name, value)
{
    if (value == Infinity)
    {
        value = "Inf.";
    }

    return "<tr id='option_" + name + "' class='auto'>"+
            "<td>" + name + ": </td>"+
            "<td class='auto'>" + value + "</td>"+
        "</tr>";
}

/**
 * Uma opção que pode ser alterada (como um argumento).
 */
function addArgumentOption(name, value, ref, mydefaults)
{
    mydefaults = mydefaults || {};

    var text = "<tr name='" + name + "' id='option_" + name + "'><td>" + name + ": </td><td>";

    switch(value)
    {
        case Infinity:
            text += "Inf";
            break;

        case Boolean:
            text += "<select name='" + name + "' value='" + (value ? "true" : "false") + "'><option>False</option><option>True</select>";
            break;

        case Number:
            text += "<input name='" + name + "' value='" + String(value || 0) + "' type='number'>";
            break;

        default:
            switch(typeof(value))
            {
                case "number":
                    text += "<span class='optspan'>" + value + "x</span><input name='" + name + "' type='number' class='text' value='" + (mydefaults[name] || 1) + "'>";
                    break;

                case "string":
                    text += "<input name='" + name + "' type='text' class='text wide' value='" + value + "'>";
                    break;

                case "object":
                    text += "<select name='" + name + "'>";

                    for (i in value)
                    {
                        text += "<option>" + value[i] + "</option>";
                    }

                    text += "<select>";
                    break;
            }

            break;
    }

    return text + "</td></tr>";
}

/**
 * Garante que os elementos de entrada e seleção sejam
 * válidos e atualize quando necessário.
 */
function ensureOptionsAboveZero(updatefunc)
{
    updatefunc = updatefunc || editorUpdateFollower;

    /**
     * Para cada elemento de entrada, não o deixe cair abaixo de 0.
     */
    var elements = editor.options.getElementsByTagName("input");
    var element;

    for (i = elements.length - 1; i >= 0; --i)
    {
        element = elements[i];
        element.onchange = element.onclick = element.onkeypress = editorInputEnsureAboveZero;
    }

    /**
     * Os elementos selecionados também precisam atualizar o
     * seguidor sobre a mudança.
     */
    elements = options.getElementsByTagName("select");

    for (i = elements.length - 1; i >= 0; --i)
    {
        element = elements[i];
        element.onchange = element.onclick = element.onkeypress = editorUpdateFollower;
    }
}

/**
 *
 */
function editorInputEnsureAboveZero(event)
{
    /**
     * var me = event.target;
     * var min = editor.current_thing.minimum || 0;
     * var value = me.value = Number(me.value) || min;
     *
     * setTimeout(function()
     * {
     *     if (value < me.min)
     *     {
     *         me.value = min;
     *     }
     * }, 35);
     */

    editorUpdateFollower(event);
}

/**
 * O Seguidor.
 */
function editorUpdateFollower(event)
{
    /**
     * Se as configurações forem escolhidas, faça isso.
     */
    if (editor.in_settings)
    {
        return editorUpdateSettingsOption(event);
    }

    var current_thing = editor.current_thing;
    var args;
    var follower;

    /**
     * Se já houver um, remover-lo.
     */
    if (follower = editor.follower)
    {
        follower.id = "";
        killNormal(follower);
    }

    /**
     * Se tiver sua própria função (por exemplo, um Currier Sprite), use-o.
     */
    if (current_thing.createfunc)
    {
        follower = current_thing.createfunc(editor.current_thing, editorGetArguments());
    } else
    {
        /**
         * Caso contrário, passe-o para ThingCreate com argumentos.
         */
        follower = ThingCreate(window[editor.current_thing_name], current_thing.followerUpdate(editor.current_thing, editorGetArguments()));
    }

    /**
     * Os argumentos definem coisas como tamanho e adição.
     */
    editor.follower = follower;

    /**
     * Também forneça coisas como o ID do CSS e o onclick.
     */
    proliferate(follower, {
        id: "follower",

        /**
         * Apenas no caso (para cenário).
         */
        libtype: editor.section_name,

        /**
         * Apenas no caso (para lançamento de HammerBro).
         */
        lookleft: true,

        nocollide: true,
        reference: current_thing,
        onclick: editorMouseClick
    }, true);

    /**
     * Adicione-o e dê a ele a classe 'editor'.
     */
    addThing(follower);
    addClass(follower, "editor");

    /**
     * Não o deixe fazer nada, a menos que seja uma passagem 'ao vivo'.
     */
    thingRetrieveVelocity(follower);
    thingStoreVelocity(follower);

    /**
     * Certifique-se de que tem uma posição.
     */
    editorSetFollowerPosition(follower);

    /**
     * Esconda-o se houver uma borracha.
     */
    if (editor.erasing)
    {
        follower.hidden = true;
    }
}

/**
 * Pega as entradas e seus valores de #options.
 */
function editorGetArguments()
{
    var inputs = arrayMake(editor.options.getElementsByTagName("input"));
    var selects = arrayMake(editor.options.getElementsByTagName("select"));
    var combined = inputs.concat(selects);

    pairs = generateInputNameValuePairs(combined);

    return pairs;
}

/**
 *
 */
function generateInputNameValuePairs(inputs)
{
    var output = {};
    var i;

    for (i in inputs)
    {
        output[inputs[i].name] = inputs[i].value;
    }

    return output;
}

/**
 * Sempre que o cursor se mover, coloque-o naquele local.
 */
function editorFollowerFollowsCursor(event)
{
    var follower = editor.follower;

    if (!follower)
    {
        return;
    }

    var xloc = roundFollowerDigit(event.x) + (editor.current_thing.widthoff - editor.offset.x) * unitsize;
    var yloc = roundFollowerDigit(event.y) + editor.current_thing.heightoff * unitsize;

    editorSetFollowerPosition(follower, xloc, yloc);
}

/**
 *
 */
function editorSetFollowerPosition(follower, xloc, yloc)
{
    xloc = xloc || editor.xloc_old || 0;
    yloc = yloc || editor.yloc_old || 0;

    setLeft(follower, xloc);
    setTop(follower, yloc);

    editor.xloc_old = xloc;
    editor.yloc_old = yloc;
}

/**
 * Porque as coisas são colocadas com base em uma réguas, apesar
 * da capacidade de serem de forma livre.
 */
function roundFollowerDigit(num)
{
    /**
     * var diff = 4;
     */

    var diff = editor.section_name == "solids" ? 8 : 4;

    /**
     * switch (editor.section_name)
     * {
     *     case "solids":
     *         diff = 8;
     *         break;
     *
     *     case "characters":
     *         diff = 4;
     *         break;
     *
     *     case "scenery":
     *         diff = 2;
     *         break;
     * }
     */

    return unitsize * diff * round(num / (unitsize * diff));
}

/**
 *
 */
function roundFollowerPosition(me, num)
{
    editorSetFollowerPosition(me,
        roundFollowerDigit(me.left),
        roundFollowerDigit(me.top)
    );
}

/**
 * Métodos de atualização do seguidor.
 */

/**
 * O gerador de argumentos comum.
 * Passa em largura e altura, nessa ordem, se estiverem
 * nos argumentos.
 */
function editorFollowerUpdateStandard(reference, pairs)
{
    /**
     * Oculto é uma verificação necessária.
     */
    if (pairs.hidden == "True")
    {
        /**
         * Este é um evento porque estes são definidos antes que o novo
         * seguidor seja feito.
         */
        TimeHandler.addEvent(function()
        {
            editor.follower.hidden = true;
        });
    }

    /**
     * Mais importante, verifique a largura e a altura.
     */

    var output = [];

    if (pairs.width)
    {
        output.push(Number(pairs.width));
    }

    if (pairs.height)
    {
        output.push(Number(pairs.height));
    }

    return output;
}

/**
 * Controles do Editor.
 */

/**
 * Inicia o editorControlXXX, onde X é o que foi clicado.
 */
function editorClickControl(event)
{
    /**
     * Então o editor sabe que não deve colocar nada.
     */
    editorPreventClicks();

    /**
     * Isso pode ser o controle ou o controle firstChild.
     */
    var target = event.target;

    if (!target.id)
    {
        target = target.parentNode;
    }

    window["editorControl" + capitalizeFirst(target.id)]();

    /**
     * Isso deve impedir que ele cause uma veiculação.
     */
    event.preventDefault();
}

/**
 *
 */
function editorPreventClicks()
{
    editor.clicking = true;

    TimeHandler.addEvent(editorClickOff, 3);
}

/**
 *
 */
function editorClickOff()
{
    if (window.editor)
    {
        editor.clicking = false;
    }
}

/**
 * Exclui e exibe a última coisa colocada.
 */
function editorControlUndo()
{
    var placed = editor.placed;
    var last = placed.pop();

    if (last && !last.player)
    {
        killNormal(last);
    }
}

/**
 * Desfaz continuamente até que o colocado esteja vazio.
 */
function editorControlReset()
{
    var placed = editor.placed;
    var len = placed.length;
    var timer = roundDigit(35 / len, 21);

    TimeHandler.addEventInterval(editorControlUndo, timer, len);
}

/**
 * Cria a função e exibe a janela de envio para a pessoa.
 */
function editorControlSave()
{
    /**
     * if (editor.playing || editor.placed.length == 0)
     * {
     *     return;
     * }
     */

    /**
     * Exiba a janela de entrada/envio para a pessoa.
     */
    var rawfunc = editor.rawfunc = editorGetRawFunc();
    var title = "<span style='font-size: 1.4em;'>Clique em Enviar abaixo para começar a jogar !</span>";
    var p = "<p style='font-size: .7em; line-height: 140%;'>Este mapa será retomado automaticamente na próxima vez que você usar o editor neste computador.<br>Como alternativa, você pode copiar este texto para trabalhar novamente mais tarde usando carregar (o botão ao lado de Salvar). </p>";
    var menu = editorCreateInputWindow(title + "<br>" + p, rawfunc, editorSubmitGameFuncPlay);

    return rawfunc;
}

/**
 * Pára de tocar (realmente apenas chama loadEditor).
 */
function editorControlCancel()
{
    loadEditor();
}

/**
 * Obtém a versão de string da função do editor.
 */
function editorGetRawFunc()
{
    var placed = editor.placed;
    var lenm1 = placed.length - 1;
    var statements = new Array(i);

    /**
     * Usando o inicializador Function simples, o mapa
     * é o primeiro argumento.
     */
    var rawfunc = "  var map = arguments[0] || new Map();\n";
    var i;

    /**
     * Inicie a função complexa com a hora, local e área.
     */
    rawfunc += "\n  map.time = " + data.time.amount + ";";
    rawfunc += "\n  map.locs = [ new Location(0, true) ];";
    rawfunc += "\n  map.areas = [";
    rawfunc += "\n    new Area('" + area.setting + "', function() {";
    rawfunc += "\n      setLocationGeneration(0);\n\n";

    /**
     * Gere as pré-declarações com base no que é colocado.
     */
    for (i = lenm1; i >= 0; --i)
    {
        /**
         * As modificações são feitas pelo objeto editorPreStatement.
         */
        statements[i] = new editorPreStatement(placed[i]);
    }

    /**
     * Classifique as pré-declarações, para limpeza.
     */
    statements.sort(prethingsorter);

    /**
     * Com eles ordenados, transforme-os todos em sequências de grafemas
     * (com os 6 espaços na frente).
     */
    for (i = lenm1; i >= 0; --i)
    {
        /**
         * As modificações são feitas pelo objeto editorPreStatement.
         */
        statements[i] = "      " + statements[i].statement;
    }

    /**
     * Para que aquela falha de carregamento não aconteça.
     */
    statements = removeDuplicates(statements);

    /**
     * Adicione essas instruções à função complexa.
     */
    rawfunc += statements.join("\n");

    /**
     * Termine a função de área.
     */
    rawfunc += "\n    })";
    rawfunc += "\n  ];";
    rawfunc += "\n  return map;"

    return rawfunc;
}

/**
 * Gera uma demonstração baseada em um objeto inserido.
 */
function editorPreStatement(placer)
{
    this.placer = placer;

    /**
     * O posicionamento é importante.
     */
    this.xloc = (gamescreen.left + placer.left) / unitsize;
    this.yloc = map.floor - placer.top / unitsize;

    /**
     * Referência e argumentos são usados para fazer a declaração.
     * Usando-os, obtenha a declaração.
     */
    this.statement = editorGetStatement(this, placer, placer.reference, placer.args);
}

/**
 * Dada uma pré-declaração, isso retorna a string.
 */
function editorGetStatement(prestatement, placer, reference, args)
{
    /**
     * Se não houver uma referência, tente obtê-la na biblioteca.
     */
    if (!reference)
    {
        reference = editor[placer.libtype][placer.title];

        /**
         * Se ainda não estiver lá, ignore isso (como ScrollBlocker).
         */
        if (!reference)
        {
            return "";
        }
    }

    /**
     * A instrução sempre começa com a pré-função da referência.
     */
    var statement = (reference.prefunc || pushPreThing).name;
    var numargs = args.length;
    var argstrings;
    var arg;

    /**
     * Se tiver um criador de pré-função personalizado (como cenário),
     * faça isso.
     */
    if (reference.prefunc_custom)
    {
        statement += "(" + reference.prefunc_custom(prestatement, placer, reference, args) + ");";
    } else
    {
        /**
         * Caso contrário, gere os argumentos.
         */

        argstrings = [];

        /**
         * A menos que a referência especifique que não, adicione
         * o título do placer.
         */
        if (!reference.prefunc_solo)
        {
            argstrings.push(placer.title);
        }

        /**
         * else
         * {
         *     argstrings.push(placer.prefunc);
         * }
         */

        /**
         * Comece as argstrings com o xloc e yloc.
         */
        argstrings.push(String(prestatement.xloc));
        argstrings.push(String(prestatement.yloc));

        /**
         * Para cada argumento (0 é a coisa, então 1 em diante),
         * adicione-o à matriz de strings.
         */
        for (var i = 1; i < numargs; ++i)
        {
            /**
             * Adicione-o, dando apóstrofos à coisa, se necessário.
             */
            switch(typeof(arg = args[i]))
            {
                case "undefined":
                    break;

                case "number":
                    arg = String(round(arg));
                    break;

                default:
                    arg = String(arg);
                    break;
            }

            /**
             * Não o adicione se estiver indefinido.
             */
            if (typeof(arg) != "undefined")
            {
                argstrings.push(arg);
            }
        }

        /**
         * Faça a declaração usar os argumentos, unidos por vírgulas.
         */
        statement += "(" + argstrings.join(", ") + ");";
    }

    return statement;
}

/**
 * Apagando.
 */
function editorControlErase()
{
    !editor.erasing ? editorControlEraseOn() : editorControlEraseOff();
}

/**
 *
 */
function editorControlEraseOn()
{
    editor.erasing = editor.follower.hidden = true;
    classAdd(body, "erasing");
    classAdd(editor.controls.erase, "enabled");
}

/**
 *
 */
function editorControlEraseOff()
{
    editor.erasing = editor.follower.hidden = false;
    classRemove(body, "erasing");
    classRemove(editor.controls.erase, "enabled");
}

/**
 *
 */
function editorPlaceEraser(event)
{
    addThing(Eraser, event.x, event.y);
}

/**
 *
 */
function Eraser(me)
{
    me.width = me.height = 2;
    me.nocollide = me.nofall = true;
    me.movement = eraserErases;
    setCharacter(me, "eraser");
}

/**
 * Verifica tudo quanto a colisão (necessário porque os
 * cenários não colidem).
 */
function eraserErases(me)
{
    if (!window.editor)
    {
        return;
    }

    var placed = editor.placed;
    var arr = placed.concat(solids).concat(characters).concat(scenery);
    var other;
    var i;

    /**
     * Se isso tocar em algo colocado.
     */
    for (i = arr.length - 1; i >= 0; --i)
    {
        other = arr[i];

        if (other.player || other == editor.follower)
        {
            continue;
        }

        /**
         * Estes tocam:
         */
        if (objectsTouch(me, other))
        {
            /**
             * Ganhe do outro.
             */
            killNormal(other);

            /**
             * Retire-o do lugar.
             */
            placed.splice(placed.indexOf(other), 1);

            break;
        }
    }

    /**
     * e finalmente, ganhe de min.
     */
    killNormal(me);
}

/**
 * Carregando mapas anteriores.
 */

/**
 * Solicita a pessoa que forneça parte de uma função.
 */
function editorControlLoad()
{
    var blurb = "Cole seu trabalho em andamento aqui e clique em Enviar para continuar.";

    editorCreateInputWindow(blurb, "", editorSubmitLoad);
}

/**
 * Pega sólidos, personagens e cenários e os coloca no lugar.
 */
function addThingsToPlaced()
{
    var placed = editor.placed;

    /**
     * Pegue todas as coisas e classifique-as.
     */
    editor.placed = (editor.placed || []).concat(characters).concat(solids).concat(scenery);
    placed.sort(prethingsorter);

    /**
     * (não inclua o jogador nisso).
     */
    placed.splice(placed.indexOf(player), 1);

    /**
     * Faça com que todos os novos colocados conheçam sua referência.
     */
    for (i = placed.length - 1; i >= 0; --i)
    {
        placer = placed[i];
        placer.reference = editor[placer.libtype][placer.title];
    }
}

/**
 * Janela de entrada/submissão do editor.
 */

/**
 *
 */
function editorCreateInputWindow(blurb, value, callback)
{
    /**
     * Crie os elementos.
     */
    var bigwidth = gamescreen.unitwidth;
    var div = editor.input_window = createElement("div", {
        id: "input_window",
        innerHTML: blurb || "",
        style: {
            width: bigwidth + "px"
        }
    });

    var input = div.input = editor.window_input = createElement("textarea", {
        id: "window_input",
        value: value || "",
        style: {
            width: (bigwidth - 49) + "px"
        }
    });

    var submit = div.submit = createElement("div", {
        id: "window_submit",
        className: "window_button",
        innerText: "Submit",
        onclick: callback
    });

    var cancel = div.cancel = createElement("div", {
        id: "window_cancel",
        className: "window_button",
        innerText: "Cancel",
        onclick: editorCloseInputWindow
    });

    /**
     * Adicione-os um ao outro e ao corpo.
     */
    div.appendChild(input);
    div.appendChild(submit);
    div.appendChild(cancel);
    body.appendChild(div);

    /**
     * Remova o seguidor.
     */
    killNormal(editor.follower = false);
    editor.follower = false;

    return div;
}

/**
 *
 */
function editorCloseInputWindow(noedit)
{
    editorPreventClicks();

    /**
     * Delete the input window.
     */
    removeChildSafe(window.input_window, body);

    if (!noedit)
    {
        /**
         * Recrie a coisa atual.
         */
        editorSetCurrentThingFromName();

        /**
         * Certeza que isso é necessário.
         */
        window.editing = true;
    }

    editorUpdateFollower();
}

/**
 * É como se nunca tivesse acontecido.
 */
function editorClose(inmap)
{
    if (!window.editor)
    {
        return;
    }

    /**
     * Limpe quaisquer alterações visuais.
     */
    classRemove(body, "editor");
    classRemove(body, "erasing");

    /**
     * Remover o seguidor.
     *
     * if (window.editor)
     * {
     */

        killNormal(editor.follower);
        editor.follower = false;
        delete window.editor;

    /**
     * }
     */

    /**
     * Remova os elementos do editor (com segurança).
     */
    var ids = [
        "maplines",
        "sidebar",
        "bottombar",
        "scrollers"
    ];

    var i;

    for (i in ids)
    {
        removeChildSafe(document.getElementById(ids[i]), body);
    }

    /**
     * Pare os gatilhos do mouse.
     */
    document.onmousemove = null;
    window.editing = false;

    /**
     * A menos que isso esteja sendo chamado pelo setMap,
     * pare de fazer alterações.
     */
    if (inmap && window.map)
    {
        map.shifting = false;
    }
}

/**
 * Chamado por scrollWindow durante a edição para atualizar o seguidor.
 */
function scrollEditor(xinv, yinv)
{
    if (!window.editor)
    {
        return;
    }

    var follower = editor.follower;

    if (!follower)
    {
        return;
    }

    xinv = xinv || 0;
    yinv = yinv || 0;

    /**
     * shiftBoth(follower, xinv, yinv);
     */
    shiftAll(scenery, xinv, yinv);
    shiftAll(solids, xinv, yinv);
    shiftAll(characters, xinv, yinv);
    editor.xloc += xinv;
    editor.yloc += yinv;
}

/**
 *
 */
function editorStoreLocally()
{
    /**
     * Grave isso em localStorage.
     */
    localStorage.editorLastFunc = editor.rawfunc;
}

/**
 * Verifica uma função salva anteriormente e carrega,
 * se encontrada.
 */
function setEditorLocalRetrieval()
{
    var found = localStorage.editorLastFunc;

    if (!found)
    {
        return;
    }

    editor.rawfunc = round;
    editorSubmitGameFunc();
}

/**
 * Inicia o editor com uma função específica de editor.rawfunc.
 */
function editorSubmitGameFunc()
{
    /**
     * Se não houver nenhuma função complexa conhecida, não faça nada.
     */
    if (!window.editor || !editor.rawfunc)
    {
        return loadEditor();
    }

    var rawfunc = editor.rawfunc;
    var mapfunc = window.custommapfunc = new Function(editor.rawfunc);

    /**
     * Inicie o mapa.
     */
    mapfuncs.Custom = { Map: mapfunc };
    window.canedit = true;

    setMap(["Custom", "Map"]);
    window.canedit = editor.playing = false;

    /**
     * Carregar jogador e todas as coisas.
     */
    entryBlank(player);
    addThingsToPlaced();

    /**
     * Salvar e fechar.
     */
    editorStoreLocally();
    editorCloseInputWindow();
}

/**
 * Submete a função do programa e começa um procedimento.
 */
function editorSubmitGameFuncPlay()
{
    editorPreventClicks();
    editorSubmitGameFunc();
    editorStartPlaying();
}

/**
 * Captura a função complexa da janela de entrada.
 */
function editorSubmitLoad()
{
    if (!window.editor || !editor.window_input)
    {
        return;
    }

    editorPreventClicks();

    var rawfunc = editor.window_input.value;

    loadEditor();
    editor.rawfunc = rawfunc;
    editorSubmitGameFunc();
}

/**
 * Permite que a pessoa corra o mundo.
 */
function editorStartPlaying()
{
    editorPreventClicks();
    editor.playing = true;

    /**
     * Coloque uma pessoa normalmente.
     */
    placePlayer();
    entryPlain(player);
    nokeys = false;

    /**
     * Recupere cada coisa.
     */
    var placed = editor.placed;
    var placer;
    var ref;
    var i;

    for (i in placed)
    {
        placer = placed[i];
        thingRetrieveVelocity(placer);

        /**
         * Se precisar, devolva algumas especificações.
         */
        ref = editor[placer.libtype][placer.title];

        if (ref)
        {
            proliferate(placer, ref.onadds);
        }
    }

    /**
     * Só tem a opção de cancelar agora.
     */
    setEditorControls(["Cancel"]);
}

/**
 * Verifica um rawfunc no localStorage e o carrega, se possível.
 */
function setEditorLocalRetrieval()
{
    var found = localStorage.editorLastFunc;

    if (!found)
    {
        return;
    }

    editor.rawfunc = found;
    editorSubmitGameFunc();
    editorStoreLocally();

    /**
     * Para cada coisa agora colocada:
     */
    var placed = editor.placed;
    var i;

    for (i in placed)
    {
        /**
         * thingRetrieveVelocity(placed[i]);
         */
        thingStoreVelocity(placed[i]);
    }
}
