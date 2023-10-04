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
 * Things.js.
 * Armazena criadores, funções e modificadores de coisas.
 */

/**
 * Coisas Típicas.
 * Há muita informação armazenada em cada um deles.
 * Quantidades variáveis de argumentos são passadas para o inicializador:
 *     * var mything = new Thing(ConstructionFunc[, arg1[, arg2[, ...]]]);
 *
 * Exemplos:
 *     * var mygoomb = new Thing(Goomba);
 *     * var mykoopa = new Thing(Koopa, true);
 */
function Thing(type)
{
    /**
     * Se não houver um tipo, não faça nada.
     */
    if (arguments.length == 0 || !type)
    {
        return;
    }

    /**
     * Caso contrário, faça isso com base no tipo.
     * Certifique-se de que isso foi criado legalmente.
     */
    var self = this === window ? new Thing() : this;
    var args = self.args = arrayMake(arguments);

    args[0] = self;
    type.apply(self, args);

    self.alive = true;
    self.placed = this.outerok = 0;
    self.xvel = this.xvel || 0;
    self.yvel = this.yvel || 0;

    if (self.tolx == null)
    {
        self.tolx = 0;
    }

    if (self.toly == null)
    {
        self.toly = unitsized8;
    }

    /**
     * Para fazer: por que tirar isso não deixa as coisas muito legal ?
     */
    self.collide = self.collide || function()
    {
    };

    self.death = self.death || killNormal;
    self.animate = self.animate || emergeUp;

    var maxquads = 4;
    var num;

    if ((num = floor(self.width * unitsize / QuadsKeeper.getQuadWidth())) > 0)
    {
        maxquads += ((num + 1) * maxquads / 2);
    }

    if ((num = floor(self.height * unitsize / QuadsKeeper.getQuadHeight())) > 0)
    {
        maxquads += ((num + 1) * maxquads / 2);
    }

    self.maxquads = maxquads;
    self.quadrants = new Array(self.maxquads)
    self.overlaps = [];

    self.title = self.title || type.name;
    self.spritewidth = self.spritewidth || self.width;
    self.spriteheight = self.spriteheight || self.height;
    self.sprite = "";

    try
    {
        setContextStuff(self, self.spritewidth, self.spriteheight);
    } catch(err)
    {
        log("Falha no contexto da coisa", err, self.title, self);

        setTimeout(function()
        {
            setContextStuff(self, self.spritewidth, self.spriteheight);
        }, 1);
    }

    return self;
}

/**
 *
 */
function setContextStuff(me, spritewidth, spriteheight)
{
    me.spritewidthpixels = me.spritewidth * unitsize;
    me.spriteheightpixels = me.spriteheight * unitsize;
    me.canvas = getCanvas(me.spritewidthpixels, me.spriteheightpixels);
    me.context = me.canvas.getContext("2d", { willReadFrequently: true });
    me.imageData = me.context.getImageData(0, 0, me.spritewidthpixels, me.spriteheightpixels);
    me.sprite_type = me.sprite_type || "neither";

    canvasDisableSmoothing(me, me.context);
}

/**
 * Uma função auxiliar para fazer uma coisa dado o tipo
 * e os argumentos.
 */
function ThingCreate(type, args)
{
    var newthing = new Thing();

    Thing.apply(newthing, [type].concat(args));

    return newthing;
}

/**
 * Funções da Coisa.
 */

/**
 *
 */
function setCharacter(me, type)
{
    /**
     * Então 'shell smart' se torna 'shell'.
     */
    me.type = type.split(" ")[0];

    me.resting = me.under = me.undermid = false;
    me.alive = me.character = true;
    me.libtype = "characters";
    setClassInitial(me, "character " + type);
}

/**
 *
 */
function setSolid(me, name)
{
    me.type = "solid";
    me.name = name;
    me.solid = me.alive = true;

    /**
     * Velocidade vertical.
     */
    me.speed = me.speed || 0;

    me.collide = me.collide || characterTouchedSolid;
    me.bottomBump = me.bottomBump || function()
    {
        /**
         * AudioPlayer.play("Bump");
         */
    };

    me.action = me.action || function()
    {
    };

    me.jump = me.jump || function()
    {
    };

    me.spritewidth = me.spritewidth || 8;
    me.spriteheight = me.spriteheight || 8;
    me.libtype = "solids";
    setClassInitial(me, "solid " + name);
}

/**
 *
 */
function setScenery(me, name)
{
    setSolid(me, name);
    me.libtype = "scenery";
}

/**
 * A função principal para colocar uma coisa no mapa.
 */
function addThing(me, left, top)
{
    /**
     * Se eu é uma função (Exemplo: 'addThing(Goomba, ...)),fazer
     * uma coisa nova com isso.
     */
    if (me instanceof Function)
    {
        me = new Thing(me);
    }

    placeThing(me, left, top);
    window[me.libtype].push(me);
    me.placed = true;

    if (me.onadding)
    {
        /**
         * geralmente apenas para ciclos de sprite.
         */
        me.onadding();
    }

    setThingSprite(me);
    window["last_" + (me.title || me.group || "unknown")] = me;

    return me;
}

/**
 * Chamado por addThing para posicionamento simples.
 */
function placeThing(me, left, top)
{
    setLeft(me, left);
    setTop(me, top);
    updateSize(me);

    return me;
}

/**
 *
 */
function addText(html, left, top)
{
    var element = createElement("div",
        {
            innerHTML: html,
            className: "text",
            left: left,
            top: top,
            onclick: body.onclick || canvas.onclick,
            style: {
                marginLeft: left + "px",
                marginTop: top + "px"
            }
        }
    );

    body.appendChild(element);
    texts.push(element);

    return element;
}

/**
 * Chamado por funcSpawner colocado por pushPreText.
 * Remoção do texto quando estiver muito longe.
 */
function spawnText(me, settings)
{
    var element = me.element = addText("", me.left, me.top);

    if (typeof(settings) == "object")
    {
        proliferate(element, settings);
    } else
    {
        element.innerHTML = settings;
    }

    me.movement = false;
}

/**
 * Definido no final de shiftToLocation.
 */
function checkTexts()
{
    var delx = QuadsKeeper.getDelX();
    var element;
    var me;
    var i;

    for (i = texts.length - 1; i >= 0; --i)
    {
        me = texts[i]
        element = texts[i].element || me;
        me.right = me.left + element.clientWidth

        if (me.right < delx)
        {
            body.removeChild(element);
            killNormal(me);
            deleteThing(element, texts, i);
        }
    }
}

/**
 * Personagens (exceto o jogador, que tem seu own .js).
 */


/**
 * Items.
 */

/**
 *
 */
function Mushroom(me, type)
{
    me.group = "item";
    me.width = me.height = 8;
    me.speed = .42 * unitsize;
    me.animate = emergeUp;
    me.movement = moveSimple;
    me.collide = collideFriendly;
    me.jump = mushroomJump;
    me.death = killNormal;
    me.nofire = true;

    var name = "mushroom";

    switch(type)
    {
        case 1:
            me.action = gainLife;
            name += " gainlife";
            break;

        case -1:
            me.action = killPlayer;
            name += " death";
            break;

        default:
            me.action = playerShroom;
            name += " regular";
            break;
    }

    setCharacter(me, name);
}

/**
 *
 */
function mushroomJump(me)
{
    me.yvel -= unitsize * 1.4;
    me.top -= unitsize;
    me.bottom -= unitsize;
    updatePosition(me);
}

/**
 *
 */
function FireFlower(me)
{
    me.group = "item";
    me.width = me.height = 8;
    me.animate = emergeUp;
    me.collide = collideFriendly;
    me.action = playerShroom;
    me.nofall = me.nofire = true;
    me.movement = false;
    setCharacter(me, "fireflower");

    TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"]);
}

/**
 *
 */
function FireBall(me, moveleft)
{
    me.group = "item";
    me.width = me.height = 4;
    me.speed = unitsize * 1.75;
    me.gravity = gravity * 1.56;
    me.jumpheight = unitsize * 1.56;
    me.nofire = me.nostar = me.collide_primary = true;
    me.moveleft = moveleft;
    me.animate = emergeFire;
    me.movement = moveJumping;
    me.collide = fireEnemy;
    me.death = fireExplodes;
    setCharacter(me, "fireball");

    TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"], 4);
}

/**
 *
 */
function fireEnemy(enemy, me)
{
    if (!me.alive || me.emerging || enemy.height <= unitsize)
    {
        return;
    }

    if (enemy.nofire)
    {
        if (enemy.nofire > 1)
        {
            return me.death(me);
        }

        return;
    }

    if (enemy.solid)
    {
        AudioPlayer.playLocal("Bump", me.right);
    } else
    {
        AudioPlayer.playLocal("Kick", me.right);

        enemy.death(enemy, 2);
        scoreEnemyFire(enemy);
    }

    me.death(me);
}

/**
 *
 */
function fireDeleted()
{
    --player.numballs;
}

/**
 *
 */
function fireExplodes(me)
{
    var fire = new Thing(Firework);

    addThing(fire, me.left - fire.width / 2, me.top - fire.height / 2);
    fire.animate();
    killNormal(me);
}

/**
 *
 */
function Star(me)
{
    /**
     * DOURADO DOURADO.
     */

    me.group = "item";
    me.width = 7;
    me.height = 8;
    me.speed = unitsize * .56;
    me.jumpheight = unitsize * 1.17;
    me.gravity = gravity / 2.8;
    me.animate = emergeUp;
    me.movement = moveJumping;
    me.collide = collideFriendly;
    me.action = playerStar;
    me.death = killNormal;
    me.nofire = true;

    /**
     * Classe de item para que a estrela do jogador não seja confundida com isso.
     */
    setCharacter(me, "star item");

    TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"], 0, 7);
}

/**
 *
 */
function Shell(me, smart)
{
    me.width = 8; me.height = 7;
    me.group = "item";
    me.speed = unitsizet2;
    me.collide_primary = true;

    me.moveleft = me.xvel
        = me.move
        = me.hitcount
        = me.peeking
        = me.counting
        = me.landing
        = me.enemyhitcount
        = 0;

    me.smart = smart;
    me.movement = moveShell;
    me.collide = hitShell;
    me.death = killFlip;
    me.spawntype = Koopa;

    var name = "shell" + (smart ? " smart" : " dumb");
    setCharacter(me, name);
}

/**
 *
 */
function hitShell(one, two)
{
    /**
     * Assumindo que dois é shell.
     */
    if (one.type == "shell" && two.type != one.type)
    {
        return hitShell(two, one);
    }

    switch(one.type)
    {
        /**
         * xxx.
         */
        case "solid":
            if (two.right < one.right)
            {
                AudioPlayer.playLocal("Bump", one.left);

                setRight(two, one.left);
                two.xvel = -two.speed;
                two.moveleft = true;
            } else
            {
                AudioPlayer.playLocal("Bump", one.right);

                setLeft(two, one.right);
                two.xvel = two.speed;
                two.moveleft = false;
            }

            break;

        /**
         * Batendo pessoas.
         */
        case "player":
            var shelltoleft = objectToLeft(two, one);
            var playerjump = one.yvel > 0 && one.bottom <= two.top + unitsizet2;

            /**
             * Star Player é muito fácil.
             */
            if (one.star)
            {
                scorePlayerShell(one, two);

                return two.death(two, 2);
            }

            /**
             * Se o plug anal já estiver sendo desembarcado pelo Player:
             */
            if (two.landing)
            {
                /**
                 * Se a direção de pouso registrada não mudou:
                 */
                if (two.shelltoleft == shelltoleft)
                {
                    /**
                     * Aumente o contador de aterrissagens e não faça nada.
                     */
                    ++two.landing;

                    /**
                     * Se agora é um contador de 1, marque o shell.
                     */
                    if (two.landing == 1)
                    {
                        scorePlayerShell(one, two);
                    }

                    /**
                     * Reduza esse contador muito em breve.
                     */
                    TimeHandler.addEvent(function(two)
                    {
                        --two.landing;
                    }, 2, two);
                } else
                {
                    /**
                     * Caso contrário, o plug anal inverteu a direção
                     * durante o pouso.
                     */

                    /**
                     * Isso evita que a pessoa marque acidentalmente a posição.
                     */
                    player.death(player);
                }

                return;
            }

            /**
             * A pessoa está chutando o plug anal (batendo em um plug anal
             * que não está em movimento ou pulando sobre um plug anal).
             */
            if (two.xvel == 0 || playerjump)
            {
                /**
                 * A pessoa atingiu o shell em uma questão dominante.
                 */
                two.counting = 0;
                scorePlayerShell(one, two);

                /**
                 * A casca está espreitando.
                 */
                if (two.peeking)
                {
                    two.peeking = false;
                    removeClass(two, "peeking");

                    two.height -= unitsized8;
                    updateSize(two);
                }

                /**
                 * Se o xvel do shell for 0 (comum).
                 */
                if (two.xvel == 0)
                {
                    if (shelltoleft)
                    {
                        two.moveleft = true;
                        two.xvel = -two.speed;
                    } else
                    {
                        two.moveleft = false;
                        two.xvel = two.speed;
                    }

                    /**
                     * Certifique-se de saber para não finalizar.
                     */
                    ++two.hitcount;

                    TimeHandler.addEvent(function(two)
                    {
                        --two.hitcount;
                    }, 2, two);
                } else
                {
                    /**
                     * Caso contrário, defina xvel como 0.
                     */
                    two.xvel = 0;
                }

                /**
                 * A pessoa está pousando no shell (movimentos, xvels já
                 * definidos).
                 */
                if (playerjump)
                {
                    AudioPlayer.play("Kick");

                    /**
                     * O shell está se movendo.
                     */
                    if (!two.xvel)
                    {
                        jumpEnemy(one, two);
                        one.yvel *= 2;

                        scorePlayerShell(one, two);
                        setBottom(one, two.top - unitsize, true);
                    } else
                    {
                        /**
                         * O shell não está se movendo.
                         *
                         * shelltoleft ? setRight(two, one.left) : setLeft(two, one.right);
                         */
                        scorePlayerShell(one, two);
                    }

                    ++two.landing;
                    two.shelltoleft = shelltoleft;

                    TimeHandler.addEvent(function(two)
                    {
                        --two.landing;
                    }, 2, two);
                }
            } else
            {
                /**
                 * Como o shell está se movendo e o Player não, se o xvel
                 * estiver em direção ao player, isso vai ser um sexo.
                 */
                if (!two.hitcount && ((shelltoleft && two.xvel < 0) || (!shelltoleft && two.xvel > 0)))
                {
                    one.death(one);
                }
            }

            break;

        /**
         * Plug anal batendo em outro plug anal.
         */
        case "shell":
            /**
             * Se alguém está se movendo...
             */
            if (one.xvel != 0)
            {
                /**
                 * e dois também estão se movendo, batem um no outro.
                 */
                if (two.xvel != 0)
                {
                    var temp = one.xvel;

                    shiftHoriz(one, one.xvel = two.xvel);
                    shiftHoriz(two, two.xvel = temp);
                } else
                {
                    /**
                     * senão um coloca o plug anal nos dois.
                     */

                    score(two, 500);
                    two.death(two);
                }
            } else if(two.xvel != 0)
            {
                /**
                 * caso contrário, os dois coloca o plug anal em um.
                 */

                score(one, 500);
                one.death(one);
            }

            break;

        default:
            switch(one.group)
            {
                case "enemy":
                    if (two.xvel)
                    {
                        /**
                         * Se o plug anal estiver se movendo, coloque-o no inimigo.
                         */
                        if (one.type.split(" ")[0] == "koopa")
                        {
                            /**
                             * Se o inimigo for um koopa, transforme-o em um shell.
                             * Para fazer: automatize isso para coisas com shell (koopas, besouros).
                             */
                            var spawn = new Thing(Shell, one.smart);

                            addThing(spawn, one.left, one.bottom - spawn.height * unitsize);
                            killFlip(spawn);
                            killNormal(one);
                        } else
                        {
                            /**
                             * Caso contrário, apenas coloque o plug anal normalmente.
                             */
                            killFlip(one);
                        }

                        AudioPlayer.play("Kick");

                        score(one, findScore(two.enemyhitcount), true);
                        ++two.enemyhitcount;
                    } else
                    {
                        /**
                         * Caso contrário, a pessoa simplesmente se vira.
                         */
                        one.moveleft = objectToLeft(one, two);
                    }

                    break;

                case "item":
                    if (one.type == "shell")
                    {
                        if (two.xvel)
                        {
                            killFlip(one);
                        }

                        if (one.xvel)
                        {
                            killFlip(two);
                        }
                    } else
                    {
                        return;
                    }

                    break;
            }

            break;
    }
}

/**
 *
 */
function moveShell(me)
{
    if (me.xvel != 0)
    {
        return;
    }

    if (++me.counting == 350)
    {
        addClass(me, "peeking");
        me.peeking = true;
        me.height += unitsized8;
        updateSize(me);
    } else if(me.counting == 490)
    {
        var spawn = new Thing(me.spawntype, me.smart);

        addThing(spawn, me.left, me.bottom - spawn.height * unitsize);
        killNormal(me);
    }
}

/**
 * Assumindo que um é pessoa, dois é item.
 */
function collideFriendly(one, two)
{
    if (one.type != "player")
    {
        return;
    }

    if (two.action)
    {
        two.action(one);
    }

    two.death(two);
}

/**
 * Inimigos.
 */
function jumpEnemy(me, enemy)
{
    if (me.keys.up)
    {
        me.yvel = unitsize * -1.4;
    } else
    {
        me.yvel = unitsize * -.7;
    }

    me.xvel *= .91;

    AudioPlayer.play("Kick");

    if (enemy.group != "item" || enemy.type == "shell")
    {
        score(enemy, findScore(me.jumpcount++ + me.jumpers), true);
    }

    ++me.jumpers;

    TimeHandler.addEvent(function(me)
    {
        --me.jumpers;
    }, 1, me);
}

/**
 *
 */
function Goomba(me)
{
    me.width = me.height = 8;
    me.speed = unitsize * .21;
    me.toly = unitsize;
    me.moveleft = me.noflip = true;
    me.smart = false;
    me.group = "enemy";
    me.movement = moveSimple;
    me.collide = collideEnemy;
    me.death = killGoomba;
    setCharacter(me, "goomba");

    TimeHandler.addSpriteCycleSynched(me, [unflipHoriz, flipHoriz]);
}

/**
 * Grande: verdadeiro se deve pular abóbora (fogo, shell, etc).
 */
function killGoomba(me, big)
{
    if (!me.alive)
    {
        return;
    }

    if (!big)
    {
        var squash = new Thing(DeadGoomba);

        addThing(squash, me.left, me.bottom - squash.height * unitsize);

        TimeHandler.addEvent(killNormal, 21, squash);
        killNormal(me);
    } else
    {
        killFlip(me);
    }
}

/**
 *
 */
function DeadGoomba(me)
{
    me.width = 8;
    me.height = 4;
    me.movement = false;
    me.nocollide = me.nocollide = true;
    me.death = killNormal;
    setSolid(me, "deadGoomba");
}

/**
 * Se fly == true, então é pular.
 * Se fly for verdadeiro (uma matriz), é flutuante.
 */
function Koopa(me, smart, fly)
{
    me.width = 8;
    me.height = 12;
    me.speed = me.xvel = unitsize * .21;
    me.moveleft = me.skipoverlaps = true;
    me.group = "enemy";

    /**
     * Será que vai sair da borda.
     */
    me.smart = smart;

    var name = "koopa";
        name += (me.smart ? " smart" : " dumb");

    if (me.smart)
    {
        name+= " smart";
    }

    if (fly)
    {
        name += " flying";
        me.winged = true;

        if (fly == true)
        {
            me.movement = moveJumping;
            me.jumpheight = unitsize * 1.17;
            me.gravity = gravity / 2.8;
        } else
        {
            me.movement = moveFloating;
            me.ytop = me.begin = fly[0] * unitsize;
            me.ybot = me.end = fly[1] * unitsize;
            me.nofall = me.fly = true;
            me.changing = me.xvel = 0;
            me.yvel = me.maxvel = unitsized4;
        }
    } else
    {
        name += " regular";

        if (me.smart)
        {
            me.movement = moveSmart;
        } else
        {
            me.movement = moveSimple;
        }
    }

    me.collide = collideEnemy;
    me.death = killKoopa; 
    setCharacter(me, name);

    TimeHandler.addSpriteCycleSynched(me, ["one", "two"]);
    me.toly = unitsizet2;
}

/**
 * Big: true se deve pular shell (fire, shell, etc).
 */
function killKoopa(me, big)
{
    if (!me.alive)
    {
        return;
    }

    var spawn;

    if ((big && big != 2) || me.winged)
    {
        spawn = new Thing(Koopa, me.smart);
    } else
    {
        spawn = new Thing(Shell, me.smart);
    }

    /**
     * Coloca-o na pilha, para que seja um procedimento imediatamente
     * após a manutenção.
     */
    TimeHandler.addEvent(
        function(spawn, me)
        {
            addThing(spawn, me.left, me.bottom - spawn.height * unitsize);
            spawn.moveleft = me.moveleft;
        },
        0,
        spawn,
        me
    );

    killNormal(me);

    if (big == 2)
    {
        killFlip(spawn);
    } else
    {
        return spawn;
    }
}

/**
 *
 */
function Pirhana(me, evil)
{
    me.width = 8;
    me.height = 12;
    me.counter = 0;
    me.countermax = me.height * unitsize;
    me.dir = unitsized8;
    me.toly = unitsizet8;
    me.nofall = me.deadly = me.nocollidesolid = me.repeat = true;
    me.group = "enemy";
    me.collide = collideEnemy;
    me.death = killNormal;
    me.movement = movePirhanaInit;
    me.death = killPirhana;
    setCharacter(me, "pirhana");
}

/**
 * A representação visual de uma pirhana é visual_scenery; o colisor
 * é um grafema.
 */
function movePirhanaInit(me)
{
    me.hidden = true;

    var scenery = me.visual_scenery = new Thing(Sprite, "Pirhana");
    addThing(scenery, me.left, me.top);

    TimeHandler.addSpriteCycle(scenery, ["one", "two"]);
    me.movement = movePirhanaNew;

    /**
     * Pirhanas começam mínimos.
     */
    movePirhanaNew(me, me.height * unitsize);
}

/**
 * Mover uma pirhana move tanto ela quanto seu cenário.
 */
function movePirhanaNew(me, amount)
{
    amount = amount || me.dir;
    me.counter += amount;

    shiftVert(me, amount);
    shiftVert(me.visual_scenery, amount);

    /**
     * A altura é 0.
     */
    if (me.counter <= 0 || me.counter >= me.countermax)
    {
        me.movement = false;
        me.dir *= -1;

        TimeHandler.addEvent(movePirhanaRestart, 35, me);
    }
}

/**
 *
 */
function movePirhanaRestart(me)
{
    var marmid = getMidX(player);

    /**
     * Se a pessoa estiver muito perto e contra-atacar == 0, não faça nada.
     */
    if (me.counter >= me.countermax && marmid > me.left - unitsizet8 && marmid < me.right + unitsizet8)
    {
        setTimeout(movePirhanaRestart, 7, me);

        return;
    }

    /**
     * Caso contrário, comece novamente.
     */
    me.movement = movePirhanaNew;
}

/**
 *
 */
function killPirhana(me)
{
    if (!me && !(me = this))
    {
        return;
    }

    killNormal(me);
    killNormal(me.visual_scenery);
}

/**
 * Realmente apenas verifica toly para pirhanas.
 */
function playerAboveEnemy(player, enemy)
{
    if (player.bottom < enemy.top + enemy.toly)
    {
        return true;
    }

    return false;
}

/**
 * Supondo que um deva geralmente ser Pessoa/Objeto, dois é inimigo.
 */
function collideEnemy(one, two)
{
    /**
     * Verifique a vida.
     */
    if (!characterIsAlive(one) || !characterIsAlive(two))
    {
        return;
    }

    /**
     * Verifique se há nocollidechar.
     */
    if ((one.nocollidechar && !two.player) || (two.nocollidechar && !one.player))
    {
        return;
    }

    /**
     * Items.
     */
    if (one.group == "item")
    {
        if (one.collide_primary)
        {
            return one.collide(two, one);
        }

        /**
         * if (two.height < unitsized16 || two.width < unitsized16)
         * {
         *     return;
         * }
         */

        return;
    }

    /**
     * Pessoa em cima do inimigo.
     */
    if (!map.underwater && one.player && ((one.star && !two.nostar) || (!two.deadly && objectOnTop(one, two))))
    {
        /**
         * Aplica toly.
         */
        if (playerAboveEnemy(one, two))
        {
            return;
        }

        /**
         * A pessoa está em cima deles (ou estrela):
         */
        if (one.player && !one.star)
        {
            TimeHandler.addEvent(function(one, two)
            {
                jumpEnemy(one, two);
            }, 0, one, two);
        } else
        {
            two.nocollide = true;
        }

        /**
         * Termine o inimigo.
         * Se um objeto retornar algo, então é uma concha.
         * Certifique-se de que o Player não esteja atingindo o shell imediatamente.
         */
        var killed = two.death(two, one.star * 2);

        if (one.star)
        {
            scoreEnemyStar(two);
        } else
        {
            scoreEnemyStomp(two);

            /**
             * TimeHandler.addEvent(function(one, two)
             * {
             */

            setBottom(one, min(one.bottom, two.top + unitsize));

            /**
             * }, 0, one, two);
             */
        }

        /**
         * Faça o pessoa ter o objeto de salto.
         */
        addClass(one, "hopping");
        removeClasses(one, "correndo derrapando pulando um dois três");

        /**
         * addClass(one, "running three");
         */
        one.hopping = true;

        if (player.power == 1)
        {
            setPlayerSizeSmall(one);
        }
    } else if(one.player)
    {
        /**
         * Pessoa sendo atingida por um plug anal.
         */

        if (!playerAboveEnemy(one, two))
        {
            one.death(one);
        }
    } else
    {
        /**
         * Dois grafemas regulares colidindo.
         */
        two.moveleft = !(one.moveleft = objectToLeft(one, two));
    }
}

/**
 *
 */
function Podoboo(me, jumpheight)
{
    me.width = 7;
    me.height = 8;
    me.deadly = me.nofall = me.nocollidesolid = me.nofire = true;
    me.gravity = map.gravity / 2.1;
    me.jumpheight = (jumpheight || 64) * unitsize;
    me.speed = -map.maxyvel;
    me.movement = movePodobooInit;
    me.collide = collideEnemy;
    me.betweentime = 70;

    setCharacter(me, "podoboo");
}

/**
 *
 */
function movePodobooInit(me)
{
    if (!characterIsAlive(me))
    {
        return;
    }

    /**
     * Para o bem do editor, vire-o e oculte-o no primeiro movimento.
     *
     * flipVert(me);
     */

    me.hidden = true;
    me.heightnorm = me.top;
    me.heightfall = me.top - me.jumpheight;

    TimeHandler.addEvent(podobooJump, me.betweentime, me);
    me.movement = false;
}

/**
 *
 */
function podobooJump(me)
{
    if (!characterIsAlive(me))
    {
        return;
    }

    unflipVert(me);
    me.yvel = me.speed + me.gravity;
    me.movement = movePodobooUp;
    me.hidden = false;

    /**
     * Infelizmente, isso parece ser ocasionalmente necessário.
     */
    setThingSprite(me);
}

/**
 *
 */
function movePodobooUp(me)
{
    shiftVert(me, me.speed, true);

    if (me.top - gamescreen.top > me.heightfall)
    {
        return;
    }

    me.nofall = false;
    me.movement = movePodobooSwitch;
}

/**
 *
 */
function movePodobooSwitch(me)
{
    if (me.yvel <= 0)
    {
        return;
    }

    flipVert(me);
    me.movement = movePodobooDown;
}

/**
 *
 */
function movePodobooDown(me)
{
    if (me.top < me.heightnorm)
    {
        return;
    }

    setTop(me, me.heightnorm, true);
    me.movement = false;
    me.nofall = me.hidden = true;
    me.heightfall = me.top - me.jumpheight;

    TimeHandler.addEvent(podobooJump, me.betweentime, me);
}

/**
 *
 */
function HammerBro(me)
{
    me.width = 8;
    me.height = 12;
    me.group = "enemy";
    me.collide = collideEnemy;

    me.statex = me.counter
        = me.statey
        = me.counterx
        = me.countery
        = me.level
        = me.throwcount
        = 0;

    me.death = killFlip;
    me.movement = moveHammerBro;

    setCharacter(me, "hammerbro");
    me.gravity = gravity / 2;

    TimeHandler.addSpriteCycle(me, ["one", "two"]);
    TimeHandler.addEvent(throwHammer, 35, me, 7);
    TimeHandler.addEventInterval(jumpHammerBro, 140, Infinity, me);
}

/**
 *
 */
function moveHammerBro(me)
{
    /**
     * Deslize de um lado para o outro.
     */
    me.xvel = Math.sin(Math.PI * (me.counter += .007)) / 2.1;

    /**
     * Faça-o virar para olhar para a pessoa, se necessário.
     */
    lookTowardPlayer(me);

    /**
     * Se cair, não colida com sólidos.
     */
    me.nocollidesolid = me.yvel < 0 || me.falling;
}

/**
 *
 */
function throwHammer(me, count)
{
    if (!characterIsAlive(me) || me.nothrow || me.right < -unitsizet32)
    {
        return;
    }

    if (count != 3)
    {
        switchClass(me, "thrown", "throwing");
    }

    TimeHandler.addEvent(function(me)
    {
        if (count != 3)
        {
            if (!characterIsAlive(me))
            {
                return;
            }

            /**
             * Enviar o martelo...
             */
            switchClass(me, "throwing", "thrown");

            /**
             * var hammer = new Thing(Hammer, me.lookleft);
             */
            addThing(new Thing(Hammer, me.lookleft), me.left - unitsizet2, me.top - unitsizet2);

            /**
             * ...e vá novamente.
             */
        }

        if (count > 0)
        {
            TimeHandler.addEvent(throwHammer, 7, me, --count);
        } else
        {
            TimeHandler.addEvent(throwHammer, 70, me, 7);
            removeClass(me, "thrown");
        }
    }, 14, me);
}

/**
 *
 */
function jumpHammerBro(me)
{
    if (!characterIsAlive(me))
    {
        /**
         * Terminar.
         */
        return true;
    }

    if (!me.resting)
    {
        /**
         * Apenas pule.
         */
        return;
    }

    /**
     * Se estiver tudo bem, pule para baixo.
     */
    if (map.floor - (me.bottom / unitsize) >= jumplev1 - 2 && me.resting.name != "floor" && Math.floor(Math.random() * 2))
    {
        me.yvel = unitsize * -.7;
        me.falling = true;

        TimeHandler.addEvent(function(me)
        {
            me.falling = false;
        }, 42, me);
    } else
    {
        /**
         * Caso contrário, pule para cima.
         */
        me.yvel = unitsize * -2.1;
    }

    me.resting = false;
}

/**
 *
 */
function Hammer(me, left)
{
    me.width = me.height = 8;
    me.nocollidesolid = me.nocollidechar = me.deadly = me.nofire = true;
    me.collide = collideEnemy;
    me.yvel = -unitsize * 1.4;
    me.xvel = unitsize / 1.4;

    if (left)
    {
        me.xvel *= -1;
    }

    me.gravity = gravity / 2.1;
    setCharacter(me, "hammer");

    TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"], 3);
}

/**
 *
 */
function Cannon(me, height, nofire)
{
    me.width = 8;
    me.height = (height || 1) * 8;
    me.spriteheight = 16;

    if (!nofire)
    {
        me.movement = moveCannonInit;
    }

    me.timer = 117;
    me.repeat = true;
    setSolid(me, "cannon");
}

/**
 *
 */
function moveCannonInit(me)
{
    TimeHandler.addEventInterval(function(me)
    {
        if (player.right > me.left - unitsizet8 && player.left < me.right + unitsizet8)
        {
            /**
             * Não faça o envio se a pessoa estiver muito perto.
             */
            return;
        }

        var spawn = new Thing(BulletBill);

        if (objectToLeft(player, me))
        {
            addThing(spawn, me.left, me.top);

            spawn.direction = spawn.moveleft = true;
            spawn.xvel *= -1;

            flipHoriz(spawn);
        } else
        {
            addThing(spawn, me.left + me.width, me.top);
        }

        AudioPlayer.playLocal("Bump", me.right);
    }, 270, Infinity, me);

    me.movement = false;
}

/**
 *
 */
function BulletBill(me)
{
    me.width = 8; me.height = 7;
    me.group = "enemy";
    me.nofall = me.nofire = me.nocollidesolid = me.nocollidechar = true;
    me.speed = me.xvel = unitsized2;
    me.movement = moveSimple;
    me.collide = collideEnemy;
    me.death = killFlip;

    setCharacter(me, "bulletbill");
}

/**
 *
 */
function Bowser(me, hard)
{
    me.width = me.height = 16;
    me.speed = .28 * unitsize;
    me.gravity = gravity / 2.8;

    me.deadly = me.dx
        = me.lookleft
        = me.nokillend
        = me.skipoverlaps
        = true;

    me.moveleft = me.smart
        = me.movecount
        = me.jumpcount
        = me.firecount
        = me.deathcount
        = 0;

    me.killonend = freezeBowser;
    me.counter = -.7;
    me.group = "enemy";
    me.movement = moveBowserInit;
    me.collide = collideEnemy;
    me.death = killBowser;
    setCharacter(me, "bowser");

    TimeHandler.addSpriteCycle(me, ["one", "two"]);

    if (hard)
    {
        TimeHandler.addEvent(throwHammer, 35, me, 7);
    }
}

/**
 *
 */
function moveBowserInit(me)
{
    TimeHandler.addEventInterval(bowserJumps, 117, Infinity, me);
    TimeHandler.addEventInterval(bowserFires, 280, Infinity, me);
    TimeHandler.addEventInterval(bowserFires, 350, Infinity, me);
    TimeHandler.addEventInterval(bowserFires, 490, Infinity, me);

    me.movement = moveBowser;
}

/**
 *
 */
function moveBowser(me)
{
    if (!characterIsAlive(player))
    {
        return;
    }

    lookTowardPlayer(me);

    if (me.lookleft)
    {
        me.xvel = Math.sin(Math.PI * (me.counter += .007)) / 1.4;
    } else
    {
        me.xvel = min(me.xvel + .07, .84);
    }
}

/**
 *
 */
function bowserJumps(me)
{
    if (!characterIsAlive(me))
    {
        return true;
    }

    if (!me.resting || !me.lookleft)
    {
        return;
    }

    me.yvel = unitsize * -1.4;
    me.resting = false;

    /**
     * Se houver uma plataforma, não faça a remoção dela.
     */
    me.nocollidesolid = true;

    TimeHandler.addEventInterval(function(me)
    {
        if (me.yvel > unitsize)
        {
            me.nocollidesolid = false;

            return true;
        }
    }, 3, Infinity, me);
}

/**
 *
 */
function bowserFires(me)
{
    if (!characterIsAlive(me) || !characterIsAlive(player))
    {
        return true;
    }

    if (!me.lookleft)
    {
        return;
    }

    /**
     * xxx.
     */
    addClass(me, "firing");

    AudioPlayer.playLocal("Bowser Fires", me.left);

    /**
     * Depois de um tempo, abra e faça o envio do plug anal.
     */
    TimeHandler.addEvent(function(me)
    {
        var top = me.top + unitsizet4;
        var fire = new Thing(BowserFire, roundDigit(player.bottom, unitsizet8));

        removeClass(me, "firing");
        addThing(fire, me.left - unitsizet8, top);

        AudioPlayer.play("Bowser Fires");
    }, 14, me);
}

/**
 * Isso é para quando o Fiery Player finaliza no Bowser - o comum
 * é CastleAxeKillsBowser.
 */
function killBowser(me, big)
{
    if (big)
    {
        me.nofall = false;

        return killFlip(me);
    }

    if (++me.deathcount == 5)
    {
        me.yvel = me.speed = me.movement = 0;
        killFlip(me, 350);
        score(me, 5000);
    }
}

/**
 * Para quando o martelinho é atingido.
 */
function freezeBowser(me)
{
    me.movement = false;
    thingStoreVelocity(me);
}

/**
 * Quando o bower faz o envio de fogos e, enquanto se move horizontalmente,
 * muda de direção yloc.
 */
function BowserFire(me, ylev)
{
    me.width = 12;
    me.height = 4;
    me.xvel = unitsize * -.63;
    me.deadly = me.nofall = me.nocollidesolid = me.nofire = true;
    me.collide = collideEnemy;

    if (ylev)
    {
        me.ylev = ylev;
        me.movement = moveFlying;
    }

    setCharacter(me, "bowserfire");

    TimeHandler.addSpriteCycle(me, [unflipVert, flipVert]);
}

/**
 *
 */
function moveFlying(me)
{
    if (round(me.bottom) == round(me.ylev))
    {
        me.movement = false;

        return;
    }

    shiftVert(me, min(max(0, me.ylev - me.bottom), unitsize));
}

/**
 *
 */
function WaterBlock(me, width)
{
    me.height = 16;
    me.width = width;
    me.spritewidth = me.spriteheight = 1 / scale;
    me.repeat = true;
    setSolid(me, "water-block");
}

/**
 *
 */
function Blooper(me)
{
    me.width = 8;
    me.height = 12;
    me.nocollidesolid = me.nofall = me.moveleft = 1;
    me.squeeze = me.counter = 0;
    me.speed = unitsized2;
    me.xvel = me.speedinv = -unitsized4;
    me.movement = moveBlooper;
    me.collide = collideEnemy;
    me.death = killFlip;
    setCharacter(me, "blooper");
}

/**
 * Normalmente sobe a uma taxa crescente.
 * A cada X segundos, aperta para descer.
 * Mínimo de Y segundos, continua se a pessoa estiver abaixo até
 * que o fundo esteja 8 acima do piso.
 */
function moveBlooper(me)
{
    switch(me.counter)
    {
        case 56:
            me.squeeze = true;
            ++me.counter;
            break;

        case 63:
            squeezeBlooper(me);
            break;

        default:
            ++me.counter;
            break;
    }

    if (me.top < unitsizet16 + 10)
    {
        squeezeBlooper(me);
    }

    if (me.squeeze)
    {
        /**
         * Descendo.
         */
        me.yvel = max(me.yvel + .021, .7);
    } else
    {
        /**
         * Subindo.
         */
        me.yvel = min(me.yvel - .035, -.7);
    }

    shiftVert(me, me.yvel, true);

    if (!me.squeeze)
    {
        if (player.left > me.right + unitsizet8)
        {
            /**
             * Vá para a direita.
             */
            me.xvel = min(me.speed, me.xvel + unitsized32);
        } else if (player.right < me.left - unitsizet8)
        {
            /**
             * Vá para a esquerda.
             */
            me.xvel = max(me.speedinv, me.xvel - unitsized32);
        }
    }
}

/**
 *
 */
function squeezeBlooper(me)
{
    if (me.squeeze != 2)
    {
        addClass(me, "squeeze");
    }

    /**
     * if (!me.squeeze)
     * {
     *     me.yvel = 0;
     * }
     */

    me.squeeze = 2;
    me.xvel /= 1.17;
    setHeight(me, 10, true, true);

    /**
     * (104 (map.floor) - 12 (blooper.height) - 2) * unitsize.
     */
    if (me.top > player.bottom || me.bottom > 360)
    {
        unsqueezeBlooper(me);
    }
}

/**
 *
 */
function unsqueezeBlooper(me)
{
    me.squeeze = false;
    removeClass(me, "squeeze");

    me.counter = 0;
    setHeight(me, 12, true, true);

    /**
     * me.yvel /= 3;
     */
}

/**
 * Cheepcheeps vermelhos são mais rápidos.
 */
function CheepCheep(me, red, jumping)
{
    me.width = me.height = 8;
    me.group = "enemy";

    var name = "cheepcheep " + (red ? "red" : "");

    /**
     * Dobrado para se divertir! (também verificação do editor).
     */
    me.red = red;
    setCheepVelocities(me);

    if (jumping)
    {
        name += " jumping";
        me.jumping = true;
        me.movement = moveCheepJumping;
    } else
    {
        me.movement = moveCheepInit;
    }

    me.nofall = me.nocollidesolid = me.nocollidechar = true;
    me.death = killFlip;
    me.collide = collideEnemy;
    setCharacter(me, name);

    TimeHandler.addSpriteCycle(me, ["one", "two"]);
}

/**
 *
 */
function setCheepVelocities(me)
{
    if (me.red)
    {
        me.xvel = -unitsized4;
        me.yvel = unitsize / -24;
    } else
    {
        me.xvel = unitsize / -6;
        me.yvel = -unitsized32;
    }
}

/**
 *
 */
function moveCheepInit(me)
{
    setCheepVelocities(me);

    if (me.top < player.top)
    {
        me.yvel *= -1;
    }

    moveCheep(me);
    me.movement = moveCheep;
}

/**
 *
 */
function moveCheep(me)
{
    shiftVert(me, me.yvel);
}

/**
 *
 */
function moveCheepJumping(me)
{
    shiftVert(me, me.yvel += unitsize / 14);
}

/**
 *
 */
function startCheepSpawn()
{
    return map.zone_cheeps = TimeHandler.addEventInterval(function()
    {
        if (!map.zone_cheeps)
        {
            return true;
        }

        var spawn = new Thing(CheepCheep, true, true);

        addThing(spawn, Math.random() * player.left * player.maxspeed / unitsized2, gamescreen.height * unitsize);
        spawn.xvel = Math.random() * player.maxspeed;
        spawn.yvel = unitsize * -2.33;

        flipHoriz(spawn);
        spawn.movement = function(me)
        {
            if (me.top < ceilmax)
            {
                me.movement = moveCheepJumping; 
            } else
            {
                shiftVert(me, me.yvel);
            }
        };
    }, 21, Infinity);
}

/**
 *
 */
function Bubble(me)
{
    me.width = me.height = 2;
    me.nofall = me.nocollide = true;

    me.movement = function(me)
    {
        me.top < unitsizet16 ? killNormal(me) : shiftVert(me, me.yvel);
    };

    me.yvel = -unitsized4;
    setCharacter(me, "bubble");
}

/**
 * Normalmente em altura ?
 */
function Lakitu(me, norepeat)
{
    me.width = 8;
    me.height = 12;
    me.nofall = me.noshiftx = me.nocollidesolid = true;
    me.playerdiff = me.counter = 0;

    me.dir = -1;
    me.norepeat = norepeat;
    me.playerdiff = unitsizet16;
    me.group = "enemy";
    me.collide = collideEnemy;
    me.movement = moveLakituInit;
    me.death = killLakitu;

    setCharacter(me, "lakitu out");
    map.has_lakitu = me;
}

/**
 * A posição do lakitu começa à direita do jogador...
 */
function moveLakituInit(me)
{
    if (map.has_lakitu && me.norepeat)
    {
        return killNormal(me);
    }

    TimeHandler.addEventInterval(function(me)
    {
        if (me.alive)
        {
            throwSpiny(me);
        } else
        {
            return true;
        }
    }, 140, Infinity, me);

    me.movement = moveLakituInit2;
    moveLakituInit2(me);
    map.has_lakitu = me;
}

/**
 *
 */
function moveLakituInit2(me)
{
    if (me.right < player.left)
    {
        moveLakitu(me);
        me.movement = moveLakitu;
        map.lakitu = me;

        return true;
    }

    shiftHoriz(me, -unitsize);
}

/**
 * Então, quando estiver perto o suficiente, é sempre relativo a pessoa.
 * Isso oscila entre +/-32 (* unitsize).
 */
function moveLakitu(me)
{
    /**
     * Se a pessoa estiver se movendo rapidamente para a direita,
     * mova-se para a frente dele e fique lá.
     */
    if (player.xvel > unitsized8 && player.left > gamescreen.width * unitsized2)
    {
        if (me.left < player.right + unitsizet16)
        {
            /**
             * À 'esquerda' da pessoa.
             */
            slideToXLoc(me, player.right + unitsizet32 + player.xvel, player.maxspeed * 1.4);
            me.counter = 0;
        }
    } else
    {
        /**
         * Caso contrário, fique ao lado dele.
         */

        /**
         * me.xvel = 0;
         */
        me.counter += .007;
        slideToXLoc(me, player.left + player.xvel + Math.sin(Math.PI * me.counter) * 117, player.maxspeed * .7);
    }

    /**
     * log("moveLakitu after: " + (me.right - me.left) + "\n");
     */
}

/**
 *
 */
function throwSpiny(me)
{
    if (!characterIsAlive(me))
    {
        return false;
    }

    switchClass(me, "out", "hiding");
    TimeHandler.addEvent(function(me)
    {
        if (me.dead)
        {
            return false;
        }

        var spawn = new Thing(SpinyEgg);

        addThing(spawn, me.left, me.top);
        spawn.yvel = unitsize * -2.1;
        switchClass(me, "hiding", "out");
    }, 21, me);
}

/**
 *
 */
function killLakitu(me)
{
    delete me.noscroll;
    killFlip(me);
}

/**
 *
 */
function Spiny(me)
{
    me.width = me.height = 8;
    me.group = "enemy";
    me.speed = unitsize * .21;
    me.deadly = me.moveleft = true;
    me.smart = false;
    me.death = killFlip;
    me.collide = collideEnemy;
    me.movement = moveSimple;
    setCharacter(me, "spiny");

    TimeHandler.addSpriteCycle(me, ["one", "two"]);
}

/**
 *
 */
function SpinyEgg(me)
{
    me.height = 8; me.width = 7;
    me.group = "enemy";
    me.deadly = true;
    me.movement = moveSpinyEgg;
    me.spawntype = Spiny;
    me.spawner = me.death = createSpiny;
    me.collide = collideEnemy;
    setCharacter(me, "spinyegg");

    TimeHandler.addSpriteCycle(me, ["one", "two"]);
}

/**
 *
 */
function moveSpinyEgg(me)
{
    if (me.resting)
    {
        createSpiny(me);
    }
}

/**
 *
 */
function createSpiny(me)
{
    var spawn = new Thing(Spiny);

    addThing(spawn, me.left, me.top);
    spawn.moveleft = objectToLeft(player, spawn);
    killNormal(me);
}

/**
 *
 */
function Beetle(me)
{
    me.width = me.height = 8;
    me.group = "enemy";
    me.speed = me.xvel = unitsize * .21;

    me.nofire = 2;
    me.moveleft = true;
    me.smart = false;
    me.collide = collideEnemy;
    me.movement = moveSmart;
    me.death = killBeetle;
    setCharacter(me, "beetle");

    /**
     * me.toly = unitsizet8;
     */
    TimeHandler.addSpriteCycleSynched(me, ["one", "two"]);
}

/**
 * Big: true se deve pular shell (fire, shell, etc).
 */
function killBeetle(me, big)
{
    if (!me.alive)
    {
        return;
    }

    var spawn;

    if (big && big != 2)
    {
        spawn = new Thing(Koopa, me.smart);
    } else
    {
        spawn = new Thing(BeetleShell, me.smart);
    }

    /**
     * Coloca-o na sequência, para que seja um procedimento imediato
     * após a manutenção.
     */
    TimeHandler.addEvent(
        function(spawn, me)
        {
            addThing(spawn, me.left, me.bottom - spawn.height * unitsize);
            spawn.moveleft = me.moveleft;
        },
        0,
        spawn,
        me
    );

    killNormal(me);

    if (big == 2)
    {
        killFlip(spawn);
    } else
    {
        return spawn;
    }
}

/**
 *
 */
function BeetleShell(me)
{
    me.width = me.height = 8;
    me.nofire = true;
    me.group = "item";
    me.speed = unitsizet2;

    me.moveleft = me.xvel
        = me.move
        = me.hitcount
        = me.peeking
        = me.counting
        = me.landing
        = me.enemyhitcount
        = 0;

    me.movement = moveShell;
    me.collide = hitShell;
    me.death = killFlip;
    me.spawntype = Beetle;
    setCharacter(me, "shell beetle");
}

/**
 *
 */
function Coin(me, solid)
{
    me.group = "coin";
    me.width = 5;
    me.height = 7;

    me.nofall = me.coin
        = me.nofire
        = me.nocollidechar
        = me.nokillend
        = me.onlyupsolids
        = me.skipoverlaps
        = true;

    me.tolx = 0;
    me.toly = unitsized2;
    me.collide = hitCoin;
    me.animate = coinEmerge;
    me.death = killNormal;
    setCharacter(me, "coin one");

    TimeHandler.addSpriteCycleSynched(me, ["one", "two", "three", "two", "one"]);

    /**
     * A ativação do sólido permite que ele seja colocado deliberadamente
     * atrás dos grafemas, por razões visuais (como em 1-3).
     */
    if (solid)
    {
        me.movement = coinBecomesSolid;
    }
}

/**
 *
 */
function coinBecomesSolid(me)
{
    switchContainers(me, characters, solids);
    me.movement = false;
}

/**
 *
 */
function hitCoin(me, coin)
{
    if (!me.player)
    {
        return;
    }

    AudioPlayer.play("Coin");

    score(me, 200, false);
    gainCoin();
    killNormal(coin);
}

/**
 *
 */
function gainCoin()
{
    if (++data.coins.amount >= 100)
    {
        data.coins.amount = 0;
        gainLife();
    }

    updateDataElement(data.coins);
}

/**
 *
 */
function coinEmerge(me, solid)
{
    AudioPlayer.play("Coin");

    removeClass(me, "still");
    switchContainers(me, characters, scenery);
    score(me, 200, false);
    gainCoin();

    me.nocollide = me.alive
        = me.nofall
        = me.emerging
        = true;

    if (me.blockparent)
    {
        me.movement = coinEmergeMoveParent;
    } else
    {
        me.movement = coinEmergeMove;
    }

    me.yvel = -unitsize;

    TimeHandler.addEvent(function(me)
    {
        me.yvel *= -1;
    }, 25, me);

    TimeHandler.addEvent(function(me)
    {
        killNormal(me);
        deleteThing(me, scenery, scenery.indexOf(me));
    }, 49, me);

    TimeHandler.addEventInterval(coinEmergeMovement, 1, Infinity, me, solid);
    TimeHandler.clearClassCycle(me, 0);

    addClass(me, "anim");
    TimeHandler.addSpriteCycle(me, ["anim1", "anim2", "anim3", "anim4", "anim3", "anim2"], 0, 5);
}

/**
 *
 */
function coinEmergeMovement(me, solid)
{
    if (!me.alive)
    {
        return true;
    }

    shiftVert(me, me.yvel);

    /**
     * if (solid && solid.alive && me.bottom > solid.bottom || me.top > solid.top)
     * {
     *     killNormal(me);
     *
     *     return true;
     * }
     */
}

/**
 *
 */
function coinEmergeMove(me)
{
    shiftVert(me, me.yvel, true);
}

/**
 *
 */
function coinEmergeMoveParent(me)
{
    if (me.bottom >= me.blockparent.bottom)
    {
        killNormal(me);
    } else
    {
        shiftVert(me, me.yvel, true);
    }
}

/**
 * Pessoa.
 */
function Player(me)
{
    setPlayerSizeSmall(me);
    me.walkspeed = unitsized2;

    me.canjump = me.nofiredeath
        = me.nofire
        = me.player
        = me.nokillend
        = 1;

    me.numballs = me.moveleft
        = me.skidding
        = me.star
        = me.dying
        = me.nofall
        = me.maxvel
        = me.paddling
        = me.jumpers
        = me.landing
        = 0;

    /**
     * Evalues para false para o verificador de ciclo.
     */
    me.running = '';

    /**
     * 1 para normal,
     * 2 para grande,
     * 3 para apimentado.
     */
    me.power = data.playerpower;

    /**
     * Realmente usado apenas para animações cronometradas.
     */
    me.maxspeed = me.maxspeedsave = unitsize * 1.35;

    me.scrollspeed = unitsize * 1.75;
    me.keys = new Keys();

    me.fire = playerFires;
    me.movement = movePlayer;
    me.death = killPlayer;

    setCharacter(me, "player normal small still");
    me.tolx = unitsizet2;
    me.toly = 0;
    me.gravity = map.gravity;

    if (map.underwater)
    {
        me.swimming = true;

        TimeHandler.addSpriteCycle(me, ["swim1", "swim2"], "swimming", 5);
    }
}

/**
 *
 */
function placePlayer(xloc, yloc)
{
    clearOldPlayer();
    window.player = new Thing(Player);

    if (window.luigi)
    {
        window.player.title = "Luigi";
    } else
    {
        window.player.title = "Mario";
    }

    var adder = addThing(player, xloc || unitsizet16, yloc || (map.floor - player.height) * unitsize);

    if (data.playerpower >= 2)
    {
        playerGetsBig(player, true);

        if (data.playerpower == 3)
        {
            playerGetsFire(player, true);
        }
    }

    return adder;
}

/**
 *
 */
function clearOldPlayer()
{
    if (!window.player)
    {
        return;
    }

    /**
     * if (player.element)
     * {
     *     removeElement(player);
     * }
     */

    player.alive = false;
    player.dead = true;
}

/**
 *
 */
function Keys()
{
    /**
     * Rodar: 0 para não, 1 para a direita, -1 para esquerda.
     * Agachar: 0 para não, 1 para sim.
     * Pular: 0 para não, jumplev = 1 através de jumpmax para sim.
     */
    this.run = this.crouch = this.jump = this.jumplev = this.sprint = 0;
}

/**
 * Lojas .*vel sob .*velold para eventos estilo cogumelo.
 */
function thingStoreVelocity(me, keepmove)
{
    me.xvelOld = me.xvel || 0;
    me.yvelOld = me.yvel || 0;
    me.nofallOld = me.nofall || false;
    me.nocollideOld = me.nocollide || false;
    me.movementOld = me.movement || me.movementOld;

    me.nofall = me.nocollide = true;
    me.xvel = me.yvel = false;

    if (!keepmove)
    {
        me.movement = false;
    }
}

/**
 * Recupera .*vel para .*velold.
 */
function thingRetrieveVelocity(me, novel)
{
    if (!novel)
    {
        me.xvel = me.xvelOld || 0;
        me.yvel = me.yvelOld || 0;
    }

    me.movement = me.movementOld || me.movement;
    me.nofall = me.nofallOld || false;
    me.nocollide = me.nocollideOld || false;
}

/**
 *
 */
function removeCrouch()
{
    player.crouching = false;
    player.toly = player.tolyold || 0;

    if (player.power != 1)
    {
        removeClass(player, "crouching");
        player.height = 16;

        updateBottom(player, 0);
        updateSize(player);
    }
}

/**
 *
 */
function playerShroom(me)
{
    if (me.shrooming)
    {
        return;
    }

    AudioPlayer.play("Powerup");
    score(me, 1000, true);

    if (me.power == 3)
    {
        return;
    }

    me.shrooming = true;
    (++me.power == 2 ? playerGetsBig : playerGetsFire)(me);
    storePlayerStats();
}

/**
 * Esses três modificadores não alteram as camadas de poder.
 */
function playerGetsBig(me, noanim)
{
    setPlayerSizeLarge(me);
    me.keys.down = 0;

    removeClasses(player, "crouching small");
    updateBottom(me, 0);
    updateSize(me);

    if (!noanim)
    {
        /**
         * pause();
         *
         * A pessoa alterna entre 'shrooming1', 'shrooming2', etc.
         */
        addClass(player, "shrooming");

        var stages = [
            1,
            2,
            1,
            2,
            3,
            2,
            3
        ];

        for (var i = stages.length - 1; i >= 0; --i)
        {
            stages[i] = "shrooming" + stages[i];
        }

        /**
         * Limpe os traços do personagem.
         */
        thingStoreVelocity(player);

        /**
         * O último evento em etapas o limpa, redefine os movimentos
         * do personagem e para.
         */
        stages.push(function(me, settings)
        {
            me.shrooming = settings.length = 0;
            addClass(me, "large");

            removeClasses(me, "shrooming shrooming3");
            thingRetrieveVelocity(player);

            return true;
        });

        TimeHandler.addSpriteCycle(me, stages, "shrooming", 6);
    } else
    {
        addClass(me, "large");
    }
}

/**
 *
 */
function playerGetsSmall(me)
{
    var bottom = player.bottom;

    /**
     * pause();
     */

    me.keys.down = 0;
    thingStoreVelocity(me);
    addClass(me, "small");
    flicker(me);

    /**
     * Passo um.
     */
    removeClasses(player, "running skidding jumping fiery");
    addClass(player, "paddling");

    /**
     * Passo dois (t+21).
     */
    TimeHandler.addEvent(function(player)
    {
        removeClass(player, "large");
        setPlayerSizeSmall(player);
        setBottom(player, bottom - unitsize);
    }, 21, player);

    /**
     * Passo três (t+42).
     */
    TimeHandler.addEvent(function(player)
    {
        thingRetrieveVelocity(player, false);
        player.nocollidechar = true;
        removeClass(player, "paddling");

        if (player.running || player.xvel)
        {
            addClass(player, "running");
        }

        TimeHandler.addEvent(setThingSprite, 1, player);
    }, 42, player);

    /**
     * Passo Quatro (t+70);
     */
    TimeHandler.addEvent(function(player)
    {
        player.nocollidechar = false;
    }, 70, player);
}

/**
 *
 */
function playerGetsFire(me)
{
    removeClass(me, "intofiery");
    addClass(me, "fiery");
    player.shrooming = false;
}

/**
 *
 */
function setPlayerSizeSmall(me)
{
    setSize(me, 8, 8, true);
    updateSize(me);
}

/**
 *
 */
function setPlayerSizeLarge(me)
{
    setSize(me, 8, 16, true);
    updateSize(me);
}

/**
 * Para fazer: adicionar na medida de tamanho unitário ?
 */
function movePlayer(me)
{
    /**
     * Não pulando.
     */
    if (!me.keys.up)
    {
        me.keys.jump = 0;
    } else if(me.keys.jump > 0 && (me.yvel <= 0 || map.underwater))
    {
        /**
         * Pulando.
         */

        if (map.underwater)
        {
            playerPaddles(me);
        }

        if (me.resting)
        {
            if (me.resting.xvel)
            {
                me.xvel += me.resting.xvel;
            }

            me.resting = false;
        } else
        {
            /**
             * Saltar, não descansar.
             */

            if (!me.jumping && !map.underwater)
            {
                switchClass(me, "running skidding", "jumping");
            }

            me.jumping = true;
        }

        if (!map.underwater)
        {
            var dy = unitsize / (pow(++me.keys.jumplev, map.jumpmod - .0014 * me.xvel));

            me.yvel = max(me.yvel - dy, map.maxyvelinv);
        }
    }

    /**
     * Agachado.
     */
    if (me.keys.crouch && !me.crouching && me.resting)
    {
        if (me.power != 1)
        {
            me.crouching = true;
            addClass(me, "crouching");

            me.height = 11;
            me.tolyold = me.toly;
            me.toly = unitsizet4;

            updateBottom(me, 0);
            updateSize(me);
        }

        /**
         * Movimento da tubulação.
         */
        if (me.resting.actionTop)
        {
            me.resting.actionTop(me, me.resting, me.resting.transport);
        }
    }

    /**
     * (quanto diminuir).
     * (quanto diminuir).
     */
    var decel = 0 ;

    /**
     * Se um botão for pressionado, segure/aumente a velocidade.
     */
    if (me.keys.run != 0 && !me.crouching)
    {
        var dir = me.keys.run;

        /**
         * Nada de correr debaixo d'água.
         */
        var sprinting = (me.keys.sprint && !map.underwater) || 0;

        /**
         *
         */
        var adder = dir * (.098 * (sprinting + 1));

        /**
         * Reduza a velocidade, subtraindo e fazendo um pouco de divisão.
         */
        me.xvel += adder || 0;
        me.xvel *= .98;
        decel = .0007;

        /**
         * Se você está acelerando na direção oposta à sua velocidade atual,
         * isso é uma derrapagem.
         *
         * if (sprinting && signBool(me.keys.run) == me.moveleft).
         */
        if (signBool(me.keys.run) == me.moveleft)
        {
            if (!me.skidding)
            {
                addClass(me, "skidding");
                me.skidding = true;
            }
        } else if(me.skidding)
        {
            /**
             * Caso contrário, verifique se você não está derrapando.
             */

            removeClass(me, "skidding");
            me.skidding = false;
        }
    } else
    {
        /**
         * Caso contrário, diminua um pouco //, com um pouco mais se
         * estiver agachado.
         */

        /**
         * .98 - Boolean(me.crouching) * .07.
         */
        me.xvel *= (.98);
        decel = .035;
    }

    if (me.xvel > decel)
    {
        me.xvel-=decel;
    } else if (me.xvel < -decel)
    {
        me.xvel+=decel;
    } else if (me.xvel != 0)
    {
        me.xvel = 0;

        if (!window.nokeys && me.keys.run == 0)
        {
            if (me.keys.left_down)
            {
                me.keys.run = -1;
            } else if (me.keys.right_down)
            {
                me.keys.run = 1;
            }
        }
    }

    /**
     * Modos de movimento.
     * Desacelerando.
     */
    if (Math.abs(me.xvel) < .14)
    {
        if (me.running)
        {
            me.running = false;

            if (player.power == 1)
            {
                setPlayerSizeSmall(me);
            }

            removeClasses(me, "running skidding one two three");
            addClass(me, "still");

            TimeHandler.clearClassCycle(me, "running");
        }
    } else if(!me.running)
    {
        /**
         * Não se movendo lentamente.
         */

        me.running = true;
        switchClass(me, "still", "running");
        playerStartRunningCycle(me);

        if (me.power == 1)
        {
            setPlayerSizeSmall(me);
        }
    }

    if (me.xvel > 0)
    {
        me.xvel = min(me.xvel, me.maxspeed);

        if (me.moveleft && (me.resting || map.underwater))
        {
            unflipHoriz(me);
            me.moveleft = false;
        }
    } else if(me.xvel < 0)
    {
        me.xvel = max(me.xvel, me.maxspeed * -1);

        if (!me.moveleft && (me.resting || map.underwater))
        {
            flipHoriz(me);
            me.moveleft = true;
        }
    }

    /**
     * Eventos impede um monte de outras coisas.
     */
    if (me.resting)
    {
        /**
         * Saltitar.
         */
        if (me.hopping)
        {
            removeClass(me, "hopping");

            if (me.xvel)
            {
                addClass(me, "running");
            }

            me.hopping = false;
        }

        /**
         * Pulando.
         */
        me.keys.jumplev = me.yvel = me.jumpcount = 0;

        if (me.jumping)
        {
            me.jumping = false;
            removeClass(me, "jumping");

            if (me.power == 1)
            {
                setPlayerSizeSmall(me);
            }

            addClass(me, abs(me.xvel) < .14 ? "still" : "running");
        }

        /**
         * Remar.
         */
        if (me.paddling)
        {
            me.paddling = me.swimming = false;
            removeClasses(me, "paddling swim1 swim2");

            TimeHandler.clearClassCycle(me, "paddling");
            addClass(me, "running");
        }
    }

    if (isNaN(me.xvel))
    {
        debugger;
    }
}

/**
 * Dá a pessoa uma corrida visual.
 */
function playerStartRunningCycle(me)
{
    /**
     * setPlayerRunningCycler define o tempo entre os ciclos.
     */
    me.running = TimeHandler.addSpriteCycle(me, ["one", "two", "three", "two"], "running", setPlayerRunningCycler);
}

/**
 * Usado pelo ciclo de procedimento da pessoa para determinar o quão
 * rápido ele deve alternar entre os sprites.
 */
function setPlayerRunningCycler(event)
{
    event.timeout = 5 + ceil(player.maxspeedsave - abs(player.xvel));
}

/**
 *
 */
function playerPaddles(me)
{
    if (!me.paddling)
    {
        /**
         * removeClasses(me, "running skidding paddle1 paddle2 paddle3 paddle4 paddle5");
         */
        removeClasses(me, "skidding paddle1 paddle2 paddle3 paddle4 paddle5");
        addClass(me, "paddling");

        TimeHandler.clearClassCycle(me, "paddling_cycle");
        TimeHandler.addSpriteCycle(me, ["paddle1", "paddle2", "paddle3", "paddle3", "paddle2", "paddle1", function()
        {
            return me.paddling = false;
        }], "paddling_cycle", 5);
    }

    me.paddling = me.swimming = true;
    me.yvel = unitsize * -.84;
}

/**
 *
 */
function playerBubbles()
{
    var bubble = new Thing(Bubble);
    addThing(bubble, player.right, player.top);

    /**
     * TimeHandler.addEvent(killNormal, 140, bubble);
     */
}

/**
 *
 */
function movePlayerVine(me)
{
    var attached = me.attached;

    if (me.bottom < attached.top)
    {
        return unattachPlayer(me);
    }

    if (me.keys.run == me.attachoff)
    {
        while (objectsTouch(me, attached))
        {
            shiftHoriz(me, me.keys.run, true);
        }

        return unattachPlayer(me);
    }

    /**
     * Se o Player estiver subindo, simplesmente mova para cima.
     */
    if (me.keys.up)
    {
        me.animatednow = true;
        shiftVert(me, unitsized4 * -1, true);
    } else if(me.keys.crouch)
    {
        /**
         * Se a pessoa estiver se movendo para baixo, mova para baixo
         * e verifique se há objetos.
         */

        me.animatednow = true;
        shiftVert(me, unitsized2, true);

        if (me.bottom > attached.bottom - unitsizet4)
        {
            return unattachPlayer(me);
        }
    } else
    {
        me.animatednow = false;
    }

    if (me.animatednow && !me.animated)
    {
        addClass(me, "animated");
    } else if(!me.animatednow && me.animated)
    {
        removeClass(me, "animated");
    }

    me.animated = me.animatednow;

    if (me.bottom < -16)
    {
        /**
         * ceilmax (104) - ceillev (88).
         */

        locMovePreparations(me);

        if (!attached.locnum && map.random)
        {
            goToTransport(["Random", "Sky", "Vine"]);
        } else
        {
            shiftToLocation(attached.locnum);
        }
    }
}

/**
 *
 */
function unattachPlayer(me)
{
    /**
     * me.movementsave;
     */
    me.movement = movePlayer;

    removeClasses(me, "climbing", "animated");

    TimeHandler.clearClassCycle(me, "climbing");

    me.yvel = me.skipoverlaps
        = me.attachoff
        = me.nofall
        = me.climbing
        = me.attached
        = me.attached.attached
        = false;

    me.xvel = me.keys.run;
}

/**
 *
 */
function playerHopsOff(me, solid, addrun)
{
    removeClasses(me, "climbing running");
    addClass(me, "jumping");

    me.piping = me.nocollide = me.nofall = me.climbing = false;
    me.gravity = gravity / 4;
    me.xvel = 3.5;
    me.yvel = -3.5;

    TimeHandler.addEvent(function(me)
    {
        unflipHoriz(me);
        me.gravity = gravity;
        me.movement = movePlayer;
        me.attached = false;

        if (addrun)
        {
            addClass(me, "running")
            playerStartRunningCycle(me);
        }
    }, 21, me);
}

/**
 *
 */
function playerFires()
{
    if (player.numballs >= 2)
    {
        return;
    }

    ++player.numballs;
    addClass(player, "firing");

    var ball = new Thing(FireBall, player.moveleft, true);

    ball.yvel = unitsize
    addThing(ball, player.right + unitsized4, player.top + unitsizet8);

    if (player.moveleft)
    {
        setRight(ball, player.left - unitsized4, true);
    }

    ball.animate(ball);
    ball.ondelete = fireDeleted;

    TimeHandler.addEvent(function(player)
    {
        removeClass(player, "firing");
    }, 7, player);
}

/**
 *
 */
function emergeFire(me)
{
    AudioPlayer.play("Fireball");
}

/**
 *
 */
function playerStar(me)
{
    if (me.star)
    {
        return;
    }

    ++me.star;

    AudioPlayer.play("Powerup");
    AudioPlayer.playTheme("Star", true);

    TimeHandler.addEvent(playerRemoveStar, 560, me);
    switchClass(me, "normal", "star");

    TimeHandler.addSpriteCycle(me, ["star1", "star2", "star3", "star4"], "star", 5);
}

/**
 *
 */
function playerRemoveStar(me)
{
    if (!me.star)
    {
        return;
    }

    --me.star;
    removeClasses(me, "star star1 star2 star3 star4");

    TimeHandler.clearClassCycle(me, "star");
    addClass(me, "normal");

    AudioPlayer.playTheme();
}

/**
 * Grande significa que deve acontecer: 2 significa sem animação.
 */
function killPlayer(me, big)
{
    if (!me.alive || me.flickering || me.dying)
    {
        return;
    }

    /**
     * Se for um evento automático, é para rizzles.
     */
    if (big == 2)
    {
        notime = true;
        me.dead = me.dying = true;
    } else
    {
        /**
         * Caso contrário, é apenas um evento regular (inimigo, tempo, etc.).
         */

        /**
         * Se a pessoa puder sobreviver a isso, apenas faça a remoção.
         */
        if (!big && me.power > 1)
        {
            AudioPlayer.play("Power Down");

            me.power = 1;
            storePlayerStats();

            return playerGetsSmall(me);
        } else if(big != 2)
        {
            /**
             * Caso contrário, se este não for grande, anime um evento.
             */

            /**
             * Faça isso parecer um evento.
             */
            TimeHandler.clearAllCycles(me);

            setSize(me, 7.5, 7, true);
            updateSize(me);
            setClass(me, "character player dead");

            /**
             * Pausar algumas coisas.
             */
            nokeys = notime = me.dying = true;
            thingStoreVelocity(me);

            /**
             * Faça disso o topo dos grafemas.
             */
            containerForefront(me, characters);

            /**
             *Depois de um pouquinho, faça uma animação.
             */
            TimeHandler.addEvent(function(me)
            {
                thingRetrieveVelocity(me, true);

                me.nocollide = true;
                me.movement = me.resting = false;
                me.gravity = gravity / 2.1;
                me.yvel = unitsize * -1.4;
            }, 7, me);
        }
    }

    /**
     * Limpar e redefinir.
     */
    AudioPlayer.pause();

    if (!window.editing)
    {
        AudioPlayer.play("Player Dies");
    }

    me.nocollide = me.nomove = nokeys = 1;
    --data.lives.amount;

    if (!map.random)
    {
        data.score.amount = data.scoreold;
    }

    /**
     * Se estiver no editor, defina (quase) imediatamente o mapa.
     */
    if (window.editing)
    {
        setTimeout(function()
        {
            editorSubmitGameFuncPlay();
            editor.playing = editor.playediting = true;
        }, 35 * timer);
    } else if(!map.random || data.lives.amount <= 0)
    {
        /**
         * Se o mapa estiver normal ou, se não for alcançado o fim do programa,
         * limite o tempo limite para redefinir.
         */

        window.reset = setTimeout(data.lives.amount ? setMap : gameOver, timer * 280);
    } else
    {
        /**
         * Caso contrário, é aleatório; gere-o novamente.
         */

        nokeys = notime = false;
        updateDataElement(data.score);
        updateDataElement(data.lives);

        /**
         * placePlayer(unitsizet16, unitsizet8 * -1 + (map.underwater * unitsize * 24));
         */
        TimeHandler.addEvent(function()
        {
            playerDropsIn();

            AudioPlayer.playTheme();

            /**
             * }, 7 * (map.respawndist || 17));
             */
        }, 117);
    }
}

/**
 * Usado por mapas aleatórios para reaparecer.
 */
function playerDropsIn()
{
    /**
     * Limpe e coloque a pessoa.
     */
    clearOldPlayer();
    placePlayer(unitsizet16, unitsizet8 * -1 + (map.underwater * unitsize * 24));
    flicker(player);

    /**
     * Dê uma cama elastica para ele pousar, a menos que seja
     * debaixo d'água...
     */
    if (!map.underwater)
    {
        player.nocollide = true;

        TimeHandler.addEvent(function()
        {
            player.nocollide = false;
            addThing(new Thing(RestingStone), player.left, player.bottom + player.yvel);
        }, map.respawndist || 17);
    } else
    {
        /**
         * ...nesse caso, apenas conserte sua gravidade.
         */
        player.gravity = gravity / 2.8;
    }
}

/**
 *
 */
function gameOver()
{
    /**
     * Ter um contador de programas de -1 realmente significa
     * que está tudo bem.
     */
    gameon = false;
    pause();

    AudioPlayer.pauseTheme();
    AudioPlayer.play("Game Over");

    /**
     * (innerHeight / 2 - 28 //49).
     */
    var innerHTML = "<div style='font-size: 49px; padding-top: " + (innerHeight / 2 - 28) + "px'>FIM DO PROGRAMA</div>";

        /**
         * innerHTML += "<p style='font-size: 14px; opacity: .49; width: 490px; margin: auto; margin-top: 49px;'>";
         * innerHTML += "Você esgotou as chances. Talvez você não esteja pronto para fazer um programa verdadeiro...";
         */

    innerHTML += "</p>";

    /**
     * Para torná-lo preto.
     */
    body.className = "Night";

    body.innerHTML = innerHTML;
    window.gamecount = Infinity;

    clearPlayerStats();
    setTimeout(gameRestart, 7000);
}

/**
 *
 */
function gameRestart()
{
    seedlast = .007;
    body.style.visibility = "hidden";
    body.innerHTML = body.style.paddingTop = body.style.fontSize = "";
    body.appendChild(canvas);

    gameon = true;
    map.random ? setMapRandom() : setMap(1,1);

    TimeHandler.addEvent(function()
    {
        body.style.visibility = "";
    });

    setLives(3);
}

/**
 * Sólidos.
 */

/**
 *
 */
function Floor(me, length, height)
{
    /**
     * log(arguments);
     */

    me.width = (length || 1) * 8;
    me.height = (height * 8) || unitsizet32;
    me.spritewidth = 8;
    me.spriteheight = 8;
    me.repeat = true;
    setSolid(me, "floor");
}

/**
 * Para fazer: pare de usar nuvens e use blocos.
 */
function Clouds(me, length)
{
    me.width = length * 8;
    me.height = 8;
    setSolid(me, "clouds");
}

/**
 *
 */
function Brick(me, content)
{
    me.width = me.height = 8;
    me.used = false;
    me.bottomBump = brickBump;

    if (!content)
    {
        me.contents = false;
    } else
    {
        if (content instanceof Array)
        {
            me.contents = content;

            while (me.contents.length < 3)
            {
                me.contents.push(false);
            }
        } else
        {
            me.contents = [content, false, false];
        }
    }

    me.death = killNormal;
    setSolid(me, "brick unused");
    me.tolx = 1;
}

/**
 *
 */
function brickBump(me, character)
{
    if (me.up || character.type != "player")
    {
        return;
    }

    AudioPlayer.play("Bump");

    if (me.used)
    {
        return;
    }

    me.up = character;

    if (character.power > 1 && !me.contents)
    {
        /**
         * Espere até depois do teste de colisão para remover (para moedas).
         */
        return TimeHandler.addEvent(brickBreak, 2, me, character);
    }

    /**
     * Mova o tijolo.
     */
    blockBumpMovement(me);

    /**
     * Caso o tijolo tenha conteúdo.
     */
    if (me.contents)
    {
        /**
         * Transforme cogumelos normais em FireFlowers se a pessoa for grande.
         */
        if (player.power > 1 && me.contents[0] == Mushroom && !me.contents[1])
        {
            me.contents[0] = FireFlower;
        }

        TimeHandler.addEvent(function(me)
        {
            var contents = me.contents;
            var out = new Thing(contents[0], contents[1], contents[2]);

            addThing(out, me.left, me.top);
            setMidXObj(out, me, true);

            out.blockparent = me;
            out.animate(out, me);

            /**
             * Faça preparações especiais para moedas.
             */
            if (me.contents[0] == Coin)
            {
                if (me.lastcoin)
                {
                    makeUsedBlock(me);
                }

                TimeHandler.addEvent(function(me)
                {
                    me.lastcoin = true;
                }, 245, me );
            } else
            {
                makeUsedBlock(me);
            }
        }, 7, me);
    }
}

/**
 *
 */
function makeUsedBlock(me)
{
    me.used = true;
    switchClass(me, "unused", "used");
}

/**
 *
 */
function brickBreak(me, character)
{
    AudioPlayer.play("Break Block");

    score(me, 50);
    me.up = character;

    TimeHandler.addEvent(placeShards, 1, me);
    killNormal(me);
}

/**
 *
 */
function placeShards(me)
{
    for (var i = 0, shard; i < 4; ++i)
    {
        shard = new Thing(BrickShard);
        addThing(shard,
            me.left + (i < 2) * me.width * unitsize - unitsizet2,
            me.top + (i % 2) * me.height * unitsize - unitsizet2);

        shard.xvel = unitsized2 - unitsize * (i > 1);
        shard.yvel = unitsize * -1.4 + i % 2;

        TimeHandler.addEvent(killNormal, 350, shard);
    }
}

/**
 * Listado em grafemas por causa da gravidade. Tem nocollide,
 * então está tudo bem.
 */
function BrickShard(me)
{
    me.width = me.height = 4;
    me.nocollide = true;
    me.death = killNormal;
    setCharacter(me, "brickshard");

    TimeHandler.addSpriteCycle(me, [unflipHoriz, flipHoriz]);
}

/**
 *
 */
function attachEmerge(me, solid)
{
    me.animate = setInterval(function()
    {
        setBottom(me, solid.top, true);

        if (!solid.up)
        {
            clearInterval(me.animate);
            me.animate = false;
        }
    }, timer);
}

/**
 *
 */
function Block(me, content, hidden)
{
    me.width = me.height = 8;
    me.used = false;
    me.bottomBump = blockBump;

    if (!content)
    {
        me.contents = [Coin];
    } else
    {
        if (content instanceof Array)
        {
            me.contents = content;

            while (me.contents.length < 3)
            {
                me.contents.push(false);
            }
        } else
        {
            me.contents = [content, false, false];
        }
    }

    me.death = killNormal;
    setSolid(me, "Block unused");

    if (!hidden)
    {
        me.hidden = false;
    } else
    {
        me.hidden = me.hidden = me.skipoverlaps = true;
    }

    me.tolx = 1;

    TimeHandler.addSpriteCycleSynched(me, ["one", "two", "three", "two", "one"]);
}

/**
 *
 */
function blockBump(me, character)
{
    if (character.type != "player")
    {
        return;
    }

    if (me.used)
    {
        AudioPlayer.play("Bump");

        return;
    }

    me.used = 1;
    me.hidden = me.hidden = me.skipoverlaps = false;
    me.up = character;

    blockBumpMovement(me);
    removeClass(me, "hidden");
    switchClass(me, "unused", "used");

    if (player.power > 1 && me.contents[0] == Mushroom && !me.contents[1])
    {
        me.contents[0] = FireFlower;
    }

    TimeHandler.addEvent(blockContentsEmerge, 7, me);
}

/**
 * out é uma moeda, mas também pode ser outras coisas - [1] e [2]
 * são argumentos.
 */
function blockContentsEmerge(me)
{
    var out = new Thing(me.contents[0], me.contents[1], me.contents[2]);

    addThing(out, me.left, me.top);
    setMidXObj(out, me, true);

    out.blockparent = me;
    out.animate(out, me);
}

/**
 *
 */
function Pipe(me, height, transport)
{
    me.width = me.spritewidth = 16;
    me.height = (height || 1) * 8;

    if (transport !== false)
    {
        me.actionTop = intoPipeVert;
        me.transport = transport;
    }

    setSolid(me, "pipe");
}

/**
 *
 */
function PipeSide(me, transport, small)
{
    me.width = me.spritewidth = small ? 8 : 19.5;
    me.height = me.spriteheight = 16;

    if (transport)
    {
        me.actionLeft = intoPipeHoriz;
        me.transport = transport;
    }

    setSolid(me, "pipe side " + (small ? "small" : ""));
}

/**
 *
 */
function PipeVertical(me, height)
{
    me.spritewidth = me.width = 16;
    me.spriteheight = me.repeat = 1;
    me.height = height;
    setSolid(me, "pipe vertical");
}

/**
 * Locnum e -1 se esta é uma vidreira cutscene.
 * A vidreira real é apenas um boneco.
 */
function Vine(me, locnum)
{
    me.width = me.spriteheight = 7;
    me.height = 0;
    me.locnum = locnum;
    me.nocollide = me.nofall = me.repeat = true;
    me.animate = vineEmerge;
    me.movement = vineMovement;

    setCharacter(me, "vine");
}

/**
 *
 */
function vineEmerge(me, solid)
{
    AudioPlayer.play("Vine Emerging");

    setHeight(me, 0);
    me.movement = vineMovement;

    TimeHandler.addEvent(vineEnable, 14, me);
    TimeHandler.addEventInterval(vineStay, 1, 14, me, solid);
}

/**
 *
 */
function vineStay(me, solid)
{
    setBottom(me, solid.top);
}

/**
 *
 */
function vineEnable(me)
{
    me.nocollide = false;
    me.collide = touchVine;
}

/**
 *
 */
function vineMovement(me)
{
    increaseHeightTop(me, unitsized4);

    if (me.attached)
    {
        shiftVert(me.attached, -unitsized4, true);
    }
}

/**
 *
 */
function touchVine(me, vine)
{
    if (!me.player || me.attached || me.climbing || me.bottom > vine.bottom + unitsizet2)
    {
        return;
    }

    vine.attached = me;

    me.attached = vine;
    me.nofall = me.skipoverlaps = true;
    me.xvel = me.yvel = me.resting = me.jumping = me.jumpcount = me.running = 0;
    me.attachleft = !objectToLeft(me, vine);
    me.attachoff = me.attachleft * 2 - 1;
    me.movementsave = me.movement;
    me.movement = movePlayerVine;
    me.keys = new Keys();

    /**
     * Redefina as classes para estar no modo vine.
     */
    TimeHandler.clearClassCycle(me, "running");
    removeClass(me, "running skidding");
    unflipHoriz(me);

    if (me.attachleft)
    {
        flipHoriz(me);
    }

    addClass(me, "climbing");

    /**
     * setSize(me, 7, 8, true);
     */
    me.climbing = TimeHandler.addSpriteCycle(me, ["one", "two"], "climbing");

    /**
     * Certifique-se de estar olhando para a videira e da
     * distância certa.
     */
    lookTowardThing(me, vine);

    if (!me.attachleft)
    {
        setRight(me, vine.left + unitsizet4);
    } else
    {
        setLeft(me, vine.right - unitsizet4);
    }
}

/**
 *
 */
function Springboard(me)
{
    me.width = 8;
    me.height = me.heightnorm = 14.5;
    me.tension = me.tensionsave = 0;

    /**
     * 1 para baixo, -1 para cima (ydir).
     */
    me.dir = 1;

    me.collide = collideSpring;
    setSolid(me, "springboard");
}

/**
 *
 */
function collideSpring(me, spring)
{
    if (me.yvel >= 0 && me.player && !spring.tension && characterOnSolid(me, spring))
    {
        return springPlayerInit(spring, me);
    }

    return characterTouchedSolid(me, spring);
}

/**
 *
 */
function springPlayerInit(spring, player)
{
    spring.tension = spring.tensionsave = max(player.yvel * .77, unitsize);

    player.movement = movePlayerSpringDown;
    player.spring = spring;
    player.xvel /= 2.8;
}

/**
 *
 */
function movePlayerSpringDown(me)
{
    /**
     * Caso tenha saido da água.
     */
    if (!objectsTouch(me, me.spring))
    {
        me.movement = movePlayer;
        me.spring.movement = moveSpringUp;
        me.spring = false;

        return;
    }

    /**
     * Se a mola estiver contraída, volte para cima.
     */
    if (me.spring.height < unitsize * 2.5 || me.spring.tension < unitsized32)
    {
        me.movement = movePlayerSpringUp;
        me.spring.movement = moveSpringUp;

        return;
    }

    /**
     * Certifique-se de que é difícil deslizar.
     */
    if (me.left < me.spring.left + unitsizet2 || me.right > me.spring.right - unitsizet2)
    {
        me.xvel /= 1.4;
    }

    reduceSpringHeight(me.spring, me.spring.tension);
    setBottom(me, me.spring.top, true);

    me.spring.tension /= 2;
    updateSize(me.spring);
}

/**
 *
 */
function movePlayerSpringUp(me)
{
    if (!me.spring || !objectsTouch(me, me.spring))
    {
        me.spring = false;
        me.movement = movePlayer;

        return;
    }
}

/**
 *
 */
function moveSpringUp(spring)
{
    reduceSpringHeight(spring, -spring.tension);
    spring.tension *= 2;

    if (spring == player.spring)
    {
        setBottom(player, spring.top, true);
    }

    if (spring.height > spring.heightnorm)
    {
        if (spring == player.spring)
        {
            player.yvel = max(-unitsizet2, spring.tensionsave * -.98);
            player.resting = player.spring = false;
        }

        reduceSpringHeight(spring, (spring.height - spring.heightnorm) * unitsize);
        spring.tension = spring.tensionsave = spring.movement = false;
    }
}

/**
 *
 */
function reduceSpringHeight(spring, dy)
{
    reduceHeight(spring, dy, true);
}

/**
 *
 */
function Stone(me, width, height)
{
    me.width = (width * 8) || 8;
    me.height = (height * 8) || 8;
    me.repeat = true;
    setSolid(me, "Stone");
}

/**
 * Por razões históricas.
 */
function GenericStone(me, width, height)
{
    return Stone(me, width, height);
}

/**
 *
 */
function RestingStone(me)
{
    me.width = me.height = 8;
    me.used = false;
    me.movement = RestingStoneUnused;

    setSolid(me, "Stone hidden");
    me.title = "Stone";
}

/**
 *
 */
function RestingStoneUnused(me)
{
    /**
     * Espere até que a pessoa não esteja correndo.
     */
    if (!player.resting)
    {
        return;
    }

    /**
     * Se a pessoa estiver descansando em outra coisa, isso é
     * desnecessário.
     */
    if (player.resting != me)
    {
        return killNormal(me);
    }

    /**
     * Faça a pedra esperar até que ela não esteja mais apoiada.
     */
    me.movement = RestingStoneUsed;
    removeClass(me, "hidden");
    setThingSprite(player);
}

/**
 *
 */
function RestingStoneUsed(me)
{
    if (!player.resting)
    {
        return killNormal(me);
    }
}

/**
 *
 */
function CastleBlock(me, arg1, arg2)
{
    me.width = me.height = 8;

    var length;
    var dt;
    var hidden = false;

    /**
     * Verifique se há bolas de fogo.
     */
    if (arg1 instanceof Array)
    {
        length = arg1[0];
        dt = arg1[1];
        hidden = arg2;
    } else
    {
        length = arg1;
        dt = arg2;
    }

    /**
     * Se não estiver oculto, defina o plano de fundo.
     */
    if (!hidden)
    {
        setSolid(me, "castleblock");
    } else
    {
        /**
         * Caso contrário, é invisível.
         */
        setSolid(me, "castleblockinvis");
    }

    /**
     * Como existem bolas de fogo, defina essas coisas.
     */
    if (length)
    {
        me.balls = new Array(length);
        me.dt = .07 * (dt ? 1 : -1);
        me.timeout = round(7 / (abs(dt) || 1));
        me.movement = castleBlockSpawn;
        me.timer = me.counter = 0;
        me.angle = .25;
        me.spawn_as_char = true;
    }
}

/**
 *
 */
function castleBlockSpawn(me)
{
    for (var i = 0; i < me.balls.length; ++i)
    {
        spawn = new Thing(CastleFireBall, i * 4);

        var mid = me.width * unitsized4;
        var midx = me.left + mid;
        var midy = me.top + mid;

        me.balls[i] = addThing(spawn, midx + i * unitsize * 3, midy + i * unitsize * 3);
    }

    me.movement = false;

    var interval = abs(me.dt) || 1;

    TimeHandler.addEventInterval(castleBlockEvent, me.timeout, Infinity, me);
}

/**
 *
 */
function castleBlockEvent(me)
{
    /**
     * + me.width * unitsize / 2;
     */
    me.midx = me.left;

    /**
     * + me.height * unitsize / 2;
     */
    me.midy = me.top;

    me.counter = 0;
    me.angle += me.dt;

    /**
     * Ignore i=0 porque ele não se move.
     */
    for (var i = 1; i < me.balls.length; ++i)
    {
        setMidX(me.balls[i], me.midx + (i) * unitsizet4 * Math.cos(me.angle * Math.PI), true);
        setMidY(me.balls[i], me.midy + (i) * unitsizet4 * Math.sin(me.angle * Math.PI), true);
    }
}

/**
 * Definido como sólido porque eles geram com seus CastleBlocks.
 */
function CastleFireBall(me, distance)
{
    me.width = me.height = 4;

    me.deadly = me.nofire
        = me.nocollidechar
        = me.nocollidesolid
        = me.nofall
        = me.nostar
        = me.outerok
        = me.skipoverlaps
        = true;

    me.movement = false;
    me.collide = collideEnemy;
    setCharacter(me, "fireball castle");

    TimeHandler.addSpriteCycle(me, ["one", "two", "three", "four"], 4);
}

/**
 *
 */
function CastleBridge(me, length)
{
    me.height = 8;
    me.width = length * 8 || 4;
    me.spritewidth = 4;
    me.repeat = true;
    setSolid(me, "CastleBridge");
}

/**
 *
 */
function CastleChain(me)
{
    me.height = 8;
    me.width = me.spritewidth = 7.5;
    me.nocollide = true;
    setSolid(me, "castlechain");

    /**
     * Fazer detector simples.
     */
}

/**
 *
 */
function CastleAxe(me)
{
    me.width = me.height = 8;
    me.spritewidth = me.spriteheight = 8;
    me.nocollide = true;
    setSolid(me, "castleaxe");

    TimeHandler.addSpriteCycle(me, ["one", "two", "three", "two"]);
}

/**
 * Etapa 1 para chegar na bucetinha, vagina ou peitinhos.
 */
function CastleAxeFalls(me, collider)
{
    var axe = collider.axe;

    /**
     * Não faça isso se a pessoa cair sem a ponte.
     */
    if (!me.player || me.right < axe.left + unitsize || me.bottom > axe.bottom - unitsize)
    {
        return;
    }

    /**
     * Correr imediatamente do martelo e o colisor.
     */
    killNormal(axe);
    killNormal(collider);

    /**
     * Pause o Player e limpe os outros personagens.
     */
    notime = nokeys = true;
    thingStoreVelocity(me);
    killOtherCharacters();

    TimeHandler.addEvent(killNormal, 7, axe.chain);
    TimeHandler.addEvent(CastleAxeKillsBridge, 14, axe.bridge, axe);

    AudioPlayer.pauseTheme();
    AudioPlayer.playTheme("World Clear", false, false);
}

/**
 * Etapa 2 para chegar na bucetinha, vagina ou peitinhos.
 */
function CastleAxeKillsBridge(bridge, axe)
{
    /**
     * Diminua o tamanho da ponte.
     */
    bridge.width -= 2;
    bridge.right -= unitsizet2;

    /**
     * Se ainda estiver aqui, vá novamente.
     */
    if (bridge.width > 0)
    {
        TimeHandler.addEvent(CastleAxeKillsBridge, 1, bridge, axe);
    } else
    {
        /**
         * Caso contrário, chame a próxima etapa.
         */

        bridge.width = 0;

        TimeHandler.addEvent(CastleAxeKillsBowser, 1, axe.bowser);
    }

    setWidth(bridge, bridge.width);
}

/**
 * Etapa 3 para chegar na bucetinha, vagina ou peitinhos.
 */
function CastleAxeKillsBowser(bowser)
{
    bowser.nofall = false;
    bowser.nothrow = true;

    /**
     * Este é um procedimento comum para evitar ser atingido por martelos
     * depois que Bowser finaliza em [6-4, 7-4, 8-4].
     */
    ++player.star;

    TimeHandler.addEvent(CastleAxeContinues, 35, player);
}

/**
 * Etapa 4 para chegar na bucetinha, vagina ou peitinhos.
 */
function CastleAxeContinues(player)
{
    map.canscroll = true;
    startWalking(player);
}

/**
 *
 */
function Toad(me)
{
    me.width = 16;
    me.height = me.spriteheight = 12;
    me.group = "toad";

    setSolid(me, "toad npc");
}

/**
 *
 */
function Peach(me)
{
    me.width = 16;
    me.height = me.spriteheight = 12;
    me.group = "peach";

    setSolid(me, "peach npc");
}

/**
 * CollideCastleNPC é realmente chamado pelo FuncCollider.
 */
function collideCastleNPC(me, collider)
{
    killNormal(collider);
    me.keys.run = 0;

    TimeHandler.addEvent(function(text)
    {
        var i;

        for (i = 0; i < text.length; ++i)
        {
            TimeHandler.addEvent(proliferate, i * 70, text[i].element, {style: {visibility: "visible"}});
        }

        TimeHandler.addEvent(endLevel, (i + 3) * 70);
    }, 21, collider.text);
} 

/**
 *
 */
function TreeTop(me, width)
{
    /**
     * Os troncos das árvores são cenário.
     */
    me.width = width * 8;
    me.height = 8;
    me.repeat = true;

    setSolid(me, "treetop");
}

/**
 *
 */
function ShroomTop(me, width)
{
    /**
     * Troncos de cogumelos são cenário.
     */
    me.width = width * 8;
    me.height = 8;
    me.repeat = true;

    setSolid(me, "shroomtop");
}

/**
 * Para os floaty, se o yvel for muito grande, +1000 pontos.
 */
function Platform(me, width, settings)
{
    me.width = (width || 4) * 4;
    me.height = 4;
    me.spritewidth = 4;
    me.moving = 0;
    me.repeat = me.killonend = true;

    if (typeof(settings) == "function")
    {
        settings  = [settings];
    }

    if (settings instanceof Array)
    {
        me.movement = settings[0];
        me.begin = settings[1] * unitsize;
        me.end = settings[2] * unitsize;
        me.maxvel = (settings[3] || 1.5) * unitsized4;

        if (me.movement == moveFloating || me.movement == movePlatformSpawn)
        {
            me.yvel = me.maxvel;
        } else
        {
            me.xvel = me.maxvel;
        }

        /**
         * 0 para normal, [1] para frente/trás, [2] por esperar.
         */
        me.changing = 0;
    }

    if (me.movement == collideTransport)
    {
        me.movement = false;
        me.collide = collideTransport;
    }

    setSolid(me, "platform");
}

/**
 *
 */
function PlatformGenerator(me, width, dir)
{
    me.width = width * 4;
    me.interval = 35;
    me.height = me.interval * 6;
    me.dir = dir;
    me.nocollide = me.hidden = true;
    me.movement = PlatformGeneratorInit;
    setSolid(me, "platformgenerator");
}

/**
 *
 */
function PlatformGeneratorInit(me)
{
    for (var i = 0, inc = me.interval, height = me.height; i < height; i += inc)
    {
        me.platlast = new Thing(Platform, me.width / 4, [movePlatformSpawn, 0, 0, 1.5]);
        me.platlast.yvel *= me.dir;

        if (me.dir == 1)
        {
            addThing(me.platlast, me.left, me.top + i * unitsize);
        } else
        {
            addThing(me.platlast, me.left, me.bottom - i * unitsize);
        }

        me.platlast.parent = me;
        i += me.interval;
    }

    me.movement = false;
}

/**
 *
 */
function movePlatformSpawn(me)
{
    /**
     * Isso é como movePlatformNorm, mas também verifica se está fora
     * dos limites. Assume que foi feito com um PlatformGenerator como
     * a camada mais alta. Para fazer: faça o PlatformGenerator verificar
     * um de cada vez, não cada um deles.
     */
    if (me.bottom < me.parent.top)
    {
        setBottom(me, me.parent.bottom);
        detachPlayer(me);
    } else if (me.top > me.parent.bottom)
    {
        setTop(me, me.parent.top);
        detachPlayer(me);
    } else
    {
        movePlatformNorm(me);
    }
}

/**
 *
 */
function movePlatformNorm(me)
{
    shiftHoriz(me, me.xvel);
    shiftVert(me, me.yvel);

    if (me == player.resting && me.alive)
    {
        setBottom(player, me.top);
        shiftHoriz(player, me.xvel);

        if (player.right > innerWidth)
        {
            setRight(player, innerWidth);
        }
    }
}

/**
 *
 */
function detachPlayer(me)
{
    if (player.resting != me)
    {
        return;
    }

    player.resting = false;
}

/**
 * Colocado via pushPreScale.
 *
 * pushPreScale(xloc, yloc, width, [platwidth, offy1, offy2]);
 * settings = [platwidth, offy1, offy2] (offy é a distância da base até a plataforma).
 */
function Scale(me, width, settings)
{
    me.height = 5;
    me.width = width * 4;
    me.spritewidth = me.spriteheight = 5;
    me.repeat = me.nocollide = true;
    setSolid(me, "scale");
}

/**
 *
 */
function Flag(me)
{
    me.width = me.height = 8;
    me.nocollide = true;
    setSolid(me, "flag");
}

/**
 *
 */
function FlagPole(me)
{
    me.width = 1;
    me.height = 72;
    me.nocollide = me.repeat = true;
    setSolid(me, "flagpole");
}

/**
 *
 */
function FlagTop(me)
{
    me.spritewidth = me.spriteheight = me.width = me.height = 4;
    me.nocollide = true;
    setSolid(me, "flagtop");
}

/**
 * Os detectores são invisíveis e apenas para terminar
 * os biscoitos.
 */
function FlagDetector(me)
{
    me.width = 2;
    me.height = 100;
    me.collide = FlagCollision;

    setSolid(me, "flagdetector");
    me.hidden = true;
}

/**
 *
 */
function CastleDoorDetector(me)
{
    me.width = me.height = 4;
    me.collide = endLevelPoints;

    setSolid(me, "castledoor");
    me.hidden = true;
}

/**
 *
 */
function FlagCollision(me, detector)
{
    if (!me || !me.player)
    {
        return killNormal(me);
    }

    window.detector = detector;

    AudioPlayer.pause();
    AudioPlayer.play("Flagpole");

    /**
     * Redefina e limpe a maioria das coisas, incluindo fazer amizades com
     * todos os outros grafemas.
     */
    killOtherCharacters();
    nokeys = notime = player.nofall = 1;

    /**
     * Principalmente pessoas brancas, e colocou-o à esquerda do negócio.
     */
    player.xvel = player.yvel
        = player.keys.up
        = player.keys.jump
        = map.canscroll
        = map.ending
        = player.movement
        = 0;

    player.nocollidechar = true;
    setRight(me, detector.pole.left, true);

    removeClasses(me, "running jumping skidding");
    addClass(me, "climbing animated");
    updateSize(me);

    TimeHandler.addSpriteCycle(me, ["one", "two"], "climbing");

    /**
     * Apenas no caso de.
     */
    playerRemoveStar(player);

    /**
     * Inicie a dança.
     */
    var mebot = false;
    var flagbot = false;

    var scoreheight = (detector.stone.top - me.bottom) / unitsize, down = setInterval(function()
    {
        /**
         * Mova a pessoa até que ele atinja o fundo, ponto em que
         * mebot = true.
         */
        if(!mebot)
        {
            if (me.bottom >= detector.stone.top)
            {
                scorePlayerFlag(scoreheight, detector.stone);
                mebot = true;

                setBottom(me, detector.stone.top, true);
                removeClass(player, "animated");

                TimeHandler.clearClassCycle(player, "climbing");
            } else
            {
                shiftVert(me, unitsize, true);
            }
        }

        /**
         * Same for the flag.
         */
        if (!flagbot)
        {
            if (detector.flag.bottom >= detector.stone.top)
            {
                flagbot = true;
                setBottom(detector.flag, detector.stone.top, true);
            } else
            {
                shiftVert(detector.flag, unitsize, true);
            }
        }

        /**
         * Quando ambos estiverem na parte mais baixa:
         */
        if (mebot && flagbot)
        {
            setBottom(me, detector.stone.top, true);

            clearInterval(down);
            setTimeout(function()
            {
                FlagOff(me, detector.pole);
            }, timer * 21);
        }

        refillCanvas();
    }, timer);
}

/**
 * Estágios: 8, 28, 40, 62.
 */
function scorePlayerFlag(diff, stone)
{
    var amount;

    /**
     * log(diff);
     *
     * Casos de...
     */
    if (diff < 28)
    {
        /**
         * 0 para 8.
         */
        if (diff < 8)
        {
            amount = 100;
        } else
        {
            /**
             * 8 para 28.
             */

            amount = 400;
        }
    } else
    {
        /**
         * 28 para 40.
         */
        if (diff < 40)
        {
            amount = 800;
        } else if (diff < 62)
        {
            /**
             * 40 para 62.
             */

            amount = 2000;
        } else
        {
            /**
             * 62 = [xxx] até o fim do programa.
             */

            amount = 5000;
        }
    }

    score(player, amount, true);
}

/**
 *
 */
function FlagOff(me, pole)
{
    player.keys.run = notime = nokeys = 1;
    player.maxspeed = player.walkspeed;
    flipHoriz(me);

    TimeHandler.clearClassCycle(me, "climbing");
    setLeft(me, pole.right, true);

    setTimeout(function()
    {
        AudioPlayer.play("Stage Clear");

        playerHopsOff(me, pole, true);
    }, timer * 14);
}

/**
 * Me === Player.
 */
function endLevelPoints(me, detector)
{
    if (!me || !me.player)
    {
        return;
    }

    /**
     * Pare o programa e inicie um novo programa.
     */
    notime = nokeys = true;
    killNormal(detector);
    killNormal(me);

    /**
     * Determine o número de bolas de fogo (1, 3 e 6 tornam-se diferentes de 0).
     */
    var numfire = parseInt(getLast(String(data.time.amount)));

    if (!(numfire == 1 || numfire == 3 || numfire == 6))
    {
        numfire = 0;
    }

    /**
     * Conte os pontos (x50).
     */
    var points = setInterval(function()
    {
        /**
         * 50 para cada.
         */
        --data.time.amount;

        data.score.amount += 50;
        updateDataElement(data.score);
        updateDataElement(data.time);

        /**
         * Cada ponto (x50) reproduz o som da moeda.
         */
        AudioPlayer.play("Coin");

        /**
         * Uma vez feito isso, passe para os fogos de artifício.
         */
        if (data.time.amount <= 0)
        {
            /**
             * pause();
             */
            clearInterval(points);
            setTimeout(function()
            {
                endLevelFireworks(me, numfire, detector);
            }, timer * 49);
        }
    }, timer);
}

/**
 *
 */
function endLevelFireworks(me, numfire, detector)
{
    var nextnum;
    var nextfunc;
    var i = 0;

    if (numfire)
    {
        /**
         * var castlemid = detector.castle.left + detector.castle.width * unitsized2;
         */
        var castlemid = detector.left + 32 * unitsized2;

        while (i < numfire)
        {
            /**
             * Pré-incremento desde explodeFirework espera números
             * começando em 1.
             */
            explodeFirework(++i, castlemid);
        }

        nextnum = timer * (i + 2) * 42;
    } else
    {
        nextnum = 0;
    }

    /**
     * O endLevel real acontece depois que todos os fogos de
     * artifício são concluídos.
     */
    nextfunc = function()
    {
        setTimeout(function()
        {
            endLevel();
        }, nextnum);
    };

    /**
     * Se o som Stage Clear ainda estiver tocando, espere até que
     * ele termine.
     */
    AudioPlayer.addEventImmediate("Stage Clear", "ended", function()
    {
        TimeHandler.addEvent(nextfunc, 35);
    });
}

/**
 *
 */
function explodeFirework(num, castlemid)
{
    setTimeout(function()
    {
        var fire = new Thing(Firework, num);

        addThing(fire, castlemid + fire.locs[0] - unitsize * 6, unitsizet16 + fire.locs[1]);
        fire.animate();
    }, timer * num * 42);
}

/**
 *
 */
function Firework(me, num)
{
    me.width = me.height = 8;
    me.nocollide = me.nofire = me.nofall = true;

    /**
     * O número é > 0 se for o fim de um biscoito.
     */
    if (num)
    {
        switch(num)
        {
            /**
             * Estes provavelmente não são exatamente iguais aos comum.
             */
            case 1:
                me.locs = [unitsizet16, unitsizet16];
                break;

            case 2:
                me.locs = [-unitsizet16, unitsizet16];
                break;

            case 3:
                me.locs = [unitsizet16 * 2, unitsizet16 * 2];
                break;

            case 4:
                me.locs = [unitsizet16 * -2, unitsizet16 * 2];
                break;

            case 5:
                me.locs = [0,unitsizet16 * 1.5];
                break;

            default:
                me.locs = [0, 0];
                break;
        }
    }

    /**
     * Caso contrário, é apenas uma caminhada normal.
     */
    me.animate = function()
    {
        var name = me.className + " n";

        if (me.locs)
        {
            AudioPlayer.play("Firework");
        }

        TimeHandler.addEvent(function(me)
        {
            setClass(me, name + 1);
        }, 0, me);

        TimeHandler.addEvent(function(me)
        {
            setClass(me, name + 2);
        }, 7, me);

        TimeHandler.addEvent(function(me)
        {
            setClass(me, name + 3);
        }, 14, me);

        TimeHandler.addEvent(function(me)
        {
            killNormal(me);
        }, 21, me);
    }

    setCharacter(me, "firework");
    score(me, 500);
}

/**
 *
 */
function Coral(me, height)
{
    me.width = 8;
    me.height = height * 8;
    me.repeat = true;
    setSolid(me, "coral");
}

/**
 *
 */
function BridgeBase(me, width)
{
    me.height = 4;
    me.spritewidth = 4;
    me.width = width * 8;
    me.repeat = true;
    setSolid(me, "bridge-base");
}

/**
 *
 */
function WarpWorld(me)
{
    /**
     * 13 * 8 + 2.
     */
    me.width = 106;

    me.height = 88;
    me.movement = setWarpWorldInit;
    me.collide = enableWarpWorldText;
    me.pirhanas = [];
    me.pipes = [];
    me.texts = [];
    me.hidden = true;
    setSolid(me, "warpworld");
}

/**
 *
 */
function setWarpWorldInit(me)
{
    /**
     * Apenas reduz o tamanho.
     */
    shiftHoriz(me, me.width * unitsized2);
    me.width /= 2;

    updateSize(me); 
    me.movement = false;
}

/**
 *
 */
function enableWarpWorldText(me, warp)
{
    var pirhanas = warp.pirhanas;
    var texts = warp.texts;
    var i;

    for (i in pirhanas)
    {
        pirhanas[i].death();
    }

    for (i in texts)
    {
        texts[i].element.style.visibility = "";
    }

    killNormal(warp);
}

/**
 * Cenário.
 */

/**
 * Os tamanhos dos cenários são armazenados em window.scenery.
 * Após a criação, eles são processados.
 */
function resetScenery()
{
    window.Scenery = {
        /**
         * Tamanhos individuais para cenários.
         */
        sprites: {
            "BrickHalf": [
                8,
                4
            ],

            "BrickPlain": [
                8,
                8
            ],

            "Bush1": [
                16,
                8
            ],

            "Bush2": [
                24,
                8
            ],

            "Bush3": [
                32,
                8
            ],

            "Castle": [
                75,
                88
            ],

            "CastleDoor": [
                8,
                20
            ],

            "CastleRailing": [
                8,
                4
            ],

            "CastleRailingFilled": [
                8,
                4
            ],

            "CastleTop": [
                12,
                12
            ],

            "CastleWall": [
                8,
                48
            ],

            "Cloud1": [
                16,
                12
            ],

            "Cloud2": [
                24,
                12
            ],

            "Cloud3": [
                32,
                12
            ],

            "HillSmall": [
                24,
                9.5
            ],

            "HillLarge": [
                40,
                17.5
            ],

            "Fence": [
                8,
                8
            ],

            "Pirhana": [
                8,
                12
            ],

            "pirhana": [
                8,
                12
            ],

            "PlantSmall": [
                7,
                15
            ],

            "PlantLarge": [
                8,
                23
            ],

            "Railing": [
                4,
                4
            ],

            "ShroomTrunk": [
                8,
                8
            ],

            "String": [
                1,
                1
            ],

            "TreeTrunk": [
                8,
                8
            ],

            "Water": { 
                0: 4,
                1: 5,

                spriteCycle: [
                    "one",
                    "two",
                    "three",
                    "four"
                ]
            },

            "WaterFill": [
                4,
                5
            ]
        },

        /**
         * Especificações de cenário que podem ser colocados em uma chamada.
         * Cada um termina com "Blank" para indicar a largura final.
         */
        patterns: {
            backreg: [
                ["HillLarge", 0, 0],
                ["Cloud1", 68, 68],
                ["Bush3", 92, 0],
                ["HillSmall", 128, 0],
                ["Cloud1", 156, 76],
                ["Bush1", 188, 0],
                ["Cloud3", 220, 68],
                ["Cloud2", 292, 76],
                ["Bush2", 332, 0],
                ["Blank", 384]
            ],

            backcloud: [
                ["Cloud2", 28, 64],
                ["Cloud1", 76, 32],
                ["Cloud2", 148, 72],
                ["Cloud1", 228, 0],
                ["Cloud1", 284, 32],
                ["Cloud1", 308, 40],
                ["Cloud1", 372, 0],
                ["Blank", 384]
            ],

            backcloudmin: [
                /**
                 * Usado para criação de mapas aleatórios.
                 */
                ["Cloud1", 68, 68],
                ["Cloud1", 156, 76],
                ["Cloud3", 220, 68],
                ["Cloud2", 292, 76],
                ["Blank", 384]
            ],

            backfence: [
                ["PlantSmall", 88, 0],
                ["PlantLarge", 104, 0],
                ["Fence", 112, 0, 4],
                ["Cloud1", 148, 68],
                ["PlantLarge", 168, 0],
                ["PlantSmall", 184, 0],
                ["PlantSmall", 192, 0],
                ["Cloud1", 220, 76],
                ["Cloud2", 244, 68],
                ["Fence", 304, 0, 2],
                ["PlantSmall", 320, 0],
                ["Fence", 328, 0],
                ["PlantLarge", 344, 0],
                ["Cloud1", 364, 76],
                ["Cloud2", 388, 68],
                ["Blank", 384]
            ],

            backfencemin: [
                ["PlantLarge", 104, 0],
                ["Fence", 112, 0, 4],
                ["Cloud1", 148, 68],
                ["PlantLarge", 168, 0],
                ["PlantSmall", 184, 0],
                ["PlantSmall", 192, 0],
                ["Cloud1", 220, 76],
                ["Cloud2", 244, 68],
                ["Fence", 304, 0, 2],
                ["PlantSmall", 320, 0],
                ["Fence", 328, 0],
                ["Cloud1", 364, 76],
                ["Cloud2", 388, 68],
                ["Blank", 384]
            ],

            backfencemin2: [
                ["Cloud2", 4, 68],
                ["PlantSmall", 88, 0],
                ["PlantLarge", 104, 0],
                ["Fence", 112, 0, 1],
                ["Fence", 128, 0, 2],
                ["Cloud1", 148, 68],

                /**
                 * ["PlantLarge", 168, 0],
                 */

                ["PlantSmall", 184, 0],
                ["PlantSmall", 192, 0],
                ["Cloud1", 220, 76],
                ["Cloud2", 244, 68],
                ["Fence", 304, 0, 2],
                ["PlantSmall", 320, 0],
                ["Fence", 328, 0],
                ["PlantLarge", 344, 0],
                ["Cloud1", 364, 76],
                ["Cloud2", 388, 68],
                ["Blank", 384]
            ],

            backfencemin3: [
                ["Cloud2", 4, 68],
                ["PlantSmall", 88, 0],
                ["PlantLarge", 104, 0],
                ["Fence", 112, 0, 4],
                ["Cloud1", 148, 68],
                ["PlantSmall", 184, 0],
                ["PlantSmall", 192, 0],
                ["Cloud1", 220, 76],
                ["Cloud2", 244, 68],
                ["Cloud1", 364, 76],
                ["Cloud2", 388, 68],
                ["Blank", 384]
            ]
        }
    };

    processSceneryPatterns(Scenery.patterns);
}

/**
 * Define a largura deles e remove o elemento em branco.
 */
function processSceneryPatterns(patterns)
{
    var current;
    var i;

    for (i in patterns)
    {
        current = patterns[i];

        if (!current.length)
        {
            continue;
        }

        /**
         * O último vetor em atual deve ser ["blank", width].
         */
        current.width = current[current.length - 1][1];
        current.pop();
    }
}

/**
 * Usado em mundos como 5-2, onde as especificações são ligeiramente
 * imprecisos.
 */
function SceneryBlocker(me, width, height)
{
    me.width = width || 8;
    me.height = height || 8;
    me.nocollide = me.hidden = true;
    setSolid(me, "sceneryblocker");
}

/**
 * Um sprite baseado em scenery.sprites[name].
 * É repetido (reps = [x-rep, y-rep]) tempos ([1,1] normalmente).
 */
function Sprite(me, name, reps)
{
    if (!reps)
    {
        reps = [1, 1];
    }

    /**
     * Pegue o modelo de window.Scenery (ou enviar se não estiver lá).
     */
    var template = me.template = Scenery.sprites[name];

    if (!template)
    {
        log("Nenhum modelo de sprite encontrado para", name);

        return;
    }

    /**
     * O dimensionamento é obtido na listagem em setScenery.
     */
    me.width = (me.spritewidth = template[0]) * (reps[0] || 1);
    me.height = (me.spriteheight = template[1]) * (reps[1] || 1);
    me.unitwidth = me.spritewidth * unitsize;
    me.unitheight = me.spriteheight * unitsize;
    me.nocollide = me.maxquads = 1;
    me.repeat = true;

    setScenery(me, "scenery " + name);
    me.title = name;

    /**
     * Se a listagem tiver um SpriteCycle, faça isso.
     */
    if (template.spriteCycleTimer)
    {
        TimeHandler.addSpriteCycle(me, spriteCycleTimer, spriteCycleTimer || undefined)
    }
}

/**
 * Para fazer: isso já foi usado? (não é mais usado no céu).
 */
function LocationShifter(me, loc, size)
{
    me.loc = loc;
    me.width = size[0];
    me.height = size[1];
    me.collide = collideLocationShifter;

    me.hidden = true;
    setSolid(me, "blue");

    return;
}

/**
 *
 */
function collideLocationShifter(me, shifter)
{
    if (!me.player)
    {
        return;
    }

    shifter.nocollide = player.piping = true;

    TimeHandler.addEvent(function(me)
    {
        shiftToLocation(shifter.loc);

        if (map.random)
        {
            entryRandom(me);
        }
    }, 1, me );
}

/**
 *
 */
function ScrollBlocker(me, big)
{
    me.width = 40;

    /**
     * gamescreen.height;
     */
    me.height = 140;

    me.nocollide = me.hidden = true;
    me.big = big;

    me.movement = function()
    {
        if (me.left - player.xvel <= gamescreen.right - gamescreen.left)
        {
            map.canscroll = me.movement = false;

            /**
             * Realmente apenas para aleatório.
             */
            map.noscroll = me.big;
        }
    }

    setSolid(me, "scrollblocker");
}

/**
 *
 */
function ScrollEnabler(me)
{
    me.width = 40;

    /**
     * gamescreen.height;
     */
    me.height = 140;

    me.hidden = true;
    me.collide = function()
    {
        if (me.left - player.xvel <= gamescreen.right - gamescreen.left)
        {
            map.canscroll = me.nocollide = true;
        }
    }

    setSolid(me, "scrollenabler");
}

/**
 *
 */
function zoneToggler(me, func)
{
    me.width = 40;

    /**
     * gamescreen.height;
     */
    me.height = 140;

    me.func = func;
    me.hidden = true;
    me.collide = function(me, zone)
    {
        zone.func();
        zone.nocollide = true;
    }

    setSolid(me, "zonetoggler " + func.name);
}

/**
 *
 */
function GenerationStarter(me, func, arg)
{
    me.width = 8;
    me.height = gamescreen.height + 20;
    me.func = func;
    me.arg = arg;

    me.collide = function(character, me)
    {
        if (character.type != "player")
        {
            return false;
        }

        spawnMap();
        killNormal(me);
    };

    me.movement = function(me)
    {
        me.movement = false;
        addClass(me, "used");

        me.func((gamescreen.left + me.right) / unitsize, me.arg);
    };

    setSolid(me, "generationstarter");
    me.hidden = true;
}

/**
 *
 */
function castleDecider(me, xloc, secnum)
{
    me.height = ceilmax;
    me.width = 10;
    me.nocollide = true;
    me.xloc = xloc;
    me.section = map.area.sections[secnum];
    me.next = map.area.sections[secnum + 1];

    me.movement = function(me)
    {
        if (me.left > gamescreen.right - gamescreen.left || !me.section.activated)
        {
            return;
        }

        var section = me.section;
            section.numpass = section.colliders.length =  0;

        if (section.passed)
        {
            ++map.area.sections.current;
            me.next(me.xloc);
        } else
        {
            section(me.xloc);
        }

        section.activated = section.passed = false;

        spawnMap();
        killNormal(me);
    }

    setSolid(me, "decider blue " + secnum);
    me.hidden = true;
}

/**
 * Usado para ativadores de funções gerais, como zonas.
 */
function FuncCollider(me, func, position)
{
    /**
     * Posições extravagantes são [width, height].
     */
    if (position)
    {
        me.width = position[0];
        me.height = position[1];
    } else
    {
        /**
         * Normalmente a posição não é nada.
         */

        me.width = 8;
        me.height = ceilmax + 40;
    }

    me.collide = func;
    me.hidden = true;

    setSolid(me, "funccollider blue " + func.name);
}

/**
 *
 */
function FuncSpawner(me, func, argument)
{
    me.width = 8;
    me.height = 8;
    me.movement = function()
    {
        func(me, argument);
    };

    me.argument = argument;
    me.nocollide = me.hidden = true;
    setSolid(me, "funccollider blue " + func.name);
}

/**
 * Para fazer: substitua isso sempre que possível.
 */
function Collider(me, size, funcs)
{
    me.width = size[0];
    me.height = size[1];

    if (funcs instanceof Array)
    {
        me.func = funcs[0] || function()
        {
        };

        me.movement = funcs[1] || function()
        {
        }
    } else
    {
        me.func = funcs || function()
        {
        };

        me.movement = false;
    }

    me.collide = function(character, me)
    {
        if (!character.player)
        {
            return false;
        }

        me.func(character, me);
    }

    setSolid(me, "collider blue " + me.func.name);
    me.hidden = true;
}
