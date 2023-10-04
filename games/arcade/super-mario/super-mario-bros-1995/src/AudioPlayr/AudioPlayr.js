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
 *
 */
function playCurrentThemeHurry(name_raw)
{
    AudioPlayer.playTheme("Hurry " + (name_raw || area.theme));
}

/**
 * AudioPlayr.js.
 * Uma biblioteca para reproduzir arquivos de áudio derivados do
 * Super Mario Bros. Isso vai:
 *     1. Carregue arquivos via AJAX na inicialização.
 *     2. Crie elementos HTML5 <audio> apropriados.
 *     3. Reproduza e pause esses arquivos de áudio sob demanda.
 */
function AudioPlayr(settings)
{
    "use strict";

    /**
     * Variáveis de membros.
     */
    var version = "1.0";

    /**
     * Uma lista de nomes de arquivos a serem transformados
     * em objetos <audio>.
     */
    var library;

    /**
     * Quais tipos de arquivo adicionar como fontes de sons.
     */
    var filetypes;

    /**
     * Atualmente reproduzindo objetos sonoros, digitados por
     * nome (sem extensões).
     */
    var sounds;

    /**
     * O tema atualmente em procedimento.
     */
    var theme;

    /**
     * Se todos os sons devem ser silenciados.
     */
    var muted;

    /**
     * Diretório do qual os arquivos de áudio são AJAX,
     * se necessário.
     */
    var directory;

    /**
     * Qual nome para armazenar o valor de silenciado em localStorage.
     */
    var localStorageMuted;

    /**
     * A função ou int usada para determinar qual é o volume
     * do playLocal.
     */
    var getVolumeLocal;

    /**
     * A função ou string usada para obter um nome de tema comum.
     */
    var getThemeDefault;

    /**
     * Configurações comum usadas ao criar um novo som.
     */
    var soundSettings;

    /**
     * Funções de programa público.
     */

    /**
     * Público: pessoa.
     * Reproduz um arquivo da biblioteca de arquivos.
     */
    var play = this.play = function(name_raw)
    {
        /**
         * Primeiro verifique se isso já está em sons.
         */
        var sound = sounds[name_raw];

        /**
         * Se ainda não estiver sendo reproduzido...
         */
        if (!sound)
        {
            /**
             * Procure-o na biblioteca.
             */
            if (sound = library[name_raw])
            {
                /**
                 * Uma vez que existe, adicione-o aos sons.
                 */
                sounds[name_raw] = sound;
            } else
            {
                /**
                 * Se não estiver na biblioteca, temos uma falha.
                 */

                console.log("Som desconhecido: '" + name_raw + "'");

                return sound;
            }
        }

        /**
         * Redefinir o som para o início, no volume correto.
         * Só pra ter certeza.
         */
        sound.name_raw = name_raw;
        soundStop(sound);
        sound.volume = !muted;

        /**
         * Isso reproduz o som.
         */
        sound.play();

        /**
         * Se esta foi a primeira vez que o som foi adicionado,
         * informe como parar.
         */
        if (!(sound.used++))
        {
            sound.addEventListener("ended", function()
            {
                soundFinish(sound, name_raw);
            });
        }

        return sound;
    }

    /**
     * Público: playLocal.
     * Altera o volume de um som com base na distância do
     * objeto de referência.
     */
    this.playLocal = function(name_raw, location)
    {
        /**
         * Comece com um som típico.
         */
        var sound = play(name_raw);
        var volume_real;

        /**
         * Se esse som não funcionou, pare com ele.
         */
        if (!sound)
        {
            return sound;
        }

        /**
         * Deve haver uma maneira definida pela pessoa para determinar
         * qual deve ser o volume.
         */
        switch (getVolumeLocal.constructor)
        {
            case Function:
                volume_real = getVolumeLocal(location);
                break;

            case Number:
                volume_real = getVolumeLocal;
                break;

            default:
                volume_real = Number(volume_real) || 1;
                break;
        }

        sound.volume = sound.volume_real = volume_real = 0;

        return sound;
    }

    /**
     * Público: playTheme.
     * Reproduz um tema como sounds.theme via play().
     * Se nenhum tema for fornecido.
     */
    this.playTheme = function(name_raw, resume, loop)
    {
        /**
         * Defina a especificação de ciclo como verdadeiro.
         */
        loop = typeof loop !== 'undefined' ? loop : true;

        /**
         * Sé name_raw não for fornecido, use o getter normal.
         */
        if (!name_raw)
        {
            switch (getThemeDefault.constructor)
            {
                case Function:
                    name_raw = getThemeDefault();
                    break;

                case String:
                    name_raw = getThemeDefault;
                    break;
            }
        }

        /**
         * Primeiro, verifique se já não há um tema tocando.
         */
        if (sound = theme)
        {
            soundStop(sound);
            theme = undefined;

            delete sounds[sound.name_raw];
        }

        /**
         * Isso cria o som.
         */
        var sound = theme = play(name_raw);
            sound.loop = loop;

        /**
         * Não retome o som novamente se especificado para não.
         */
        if (!resume)
        {
            sound.used = false;
        }

        /**
         * Se for usado (sem repetição), adicione o ouvinte de evento
         * para retomar o tema.
         */
        if (sound.used == 1)
        {
            sound.addEventListener("ended", this.playTheme);
        }

        return sound;
    }

    /**
     * Utilidades públicas.
     */

    /**
     * Público: addEventListener.
     * Adiciona um ouvinte de evento a um som, se existir.
     */
    this.addEventListener = function(name_raw, event, func)
    {
        var sound = sounds[name_raw];

        if (sound)
        {
            sound.addEventListenever(event, func);
        }
    }

    /**
     * Público: addEventImmediate.
     * Chama uma função quando um som chama um gatilho ou
     * imediatamente se não estiver tocando
     */
    this.addEventImmediate = function(name_raw, event, func)
    {
        var sound = sounds[name_raw];

        if (sound && !sound.paused)
        {
            sound.addEventListener(event, func);
        } else
        {
            func();
        }
    }

    /**
     * Público: toggleMute.
     * Troca se o mute está ativado, salvando no localStorage,
     * se necessário.
     */
    this.toggleMute = function()
    {
        /**
         * Mude o volume de todos os sons para mute.
         */
        muted = !muted;

        for (var i in sounds)
        {
            sounds[i].volume = muted ? 0 : (sounds[i].volume_real || 1);
        }

        /**
         * Se especificado, armazene-o em localStorage.
         */
        if (localStorageMuted)
        {
            localStorage[localStorageMuted] = muted;
        }
    }

    /**
     * Público: funções simples de pausa e retomada.
     */

    this.pause = function()
    {
        for (var i in sounds)
        {
            if (sounds[i])
            {
                soundPause(sounds[i]);
            }
        }
    }

    this.resume = function()
    {
        for (var i in sounds)
        {
            if (sounds[i])
            {
                soundPlay(sounds[i]);
            }
        }
    }

    this.pauseTheme = function()
    {
        if (theme)
        {
            theme.pause();
        }
    }

    this.resumeTheme = function()
    {
        if (theme)
        {
            theme.play();
        }
    }

    this.clear = function()
    {
        this.pause();
        sounds = {};
        this.theme = undefined;
    }

    /**
     * Getters público.
     */
    this.getLibrary = function()
    {
        return library;
    }

    this.getSounds = function()
    {
        return sounds;
    }

    /**
     * Serviços públicos e privados.
     */

    /**
     * Chamado quando um som é feito para tirá-lo dos sons.
     */
    function soundFinish(sound, name_raw)
    {
        if (sounds[name_raw])
        {
            delete sounds[name_raw];
        }
    }

    /**
     * Reprodução rápida, pausa.
     */

    function soundPlay(sound)
    {
        sound.play();
    }

    function soundPause(sound)
    {
        sound.pause();
    }

    /**
     * Cuidadosamente interrompe um som.
     */
    function soundStop(sound)
    {
        if (sound && sound.pause)
        {
            sound.pause();

            if (sound.readyState)
            {
                sound.currentTime = 0;
            }
        }
    }

    /**
     * Carregamento / redefinição privado.
     */

    /**
     * Sons fornecidos como strings são solicitados via AJAX.
     */
    function libraryLoad()
    {
        var section;
        var name;
        var s_name;
        var j;

        /**
         * Para cada seção dada (nomes, temas):
         */
        for (s_name in library)
        {
            section = library[s_name];

            /**
             * Para cada coisa nessa seção:
             */
            for (j in section)
            {
                name = section[j];

                /**
                 * Crie o som e armazene-o no contêiner.
                 */
                library[name] = createAudio(name, s_name);
            }
        }
    }

    /**
     * Cria um elemento de áudio, fornece as fontes e inicia o
     * pré-carregamento.
     */
    function createAudio(name, section)
    {
        /**
         * var sound = document.createElement("audio");
         */
        var sound = new Audio(directory + "/" + section + "/mp3/" + name + ".mp3");
        var type;
        var i;

        /**
         * Adiciona os atributos do elemento audio.
         */
        sound.setAttribute("allow", "autoplay");
        sound.setAttribute("autoplay", "true");
        sound.setAttribute("preload", "metadata");
        sound.setAttribute("muted", "muted");

        /**
         * Copie as configurações normal para o som.
         */
        proliferate(sound, soundSettings);

        /**
         * Crie uma fonte de áudio para cada objeto de
         * nível mais baixo.
         *
         * ---
         * 1.
         * ---
         * for (i in filetypes)
         * {
         *     type = filetypes[i];
         *     sound.appendChild(proliferate(
         *         document.createElement("source"), {
         *             type: "audio/" + type,
         *             src: directory + "/" + section + "/" + type + "/" + name + "." + type
         *         }
         *     ));
         * }
         *
         * ---
         * 2.
         * ---
         * sound.setAttribute("src", directory + "/" + section + "/mp3/" + name + ".mp3");
         *
         * ---
         * 3.
         * ---
         * sound.appendChild(proliferate(
         *     document.createElement("source"), {
         *         type: "audio/mp3",
         *         src: directory + "/" + section + "/mp3/" + name + ".mp3"
         *     }
         * ));
         */

        /**
         * Isso pré-carrega o som.
         */
        sound.play();

        return sound;
    }

    /**
     * (Esta função copiada de toned.js).
     * Copia tudo, desde as configurações para o elem.
     */
    function proliferate(elem, settings)
    {
        var setting;
        var i;

        for (i in settings)
        {
            if (typeof(setting = settings[i]) == "object")
            {
                if (!elem[i])
                {
                    elem[i] = {};
                }

                proliferate(elem[i], setting);
            } else
            {
                elem[i] = setting;
            }
        }

        return elem;
    }

    /**
     * Reiniciar.
     */
    function reset(settings)
    {
        library = settings.library || {};
        filetypes = settings.filetypes || ["mp3", "ogg"];
        muted = settings.muted || false;
        directory = settings.directory || "";
        localStorageMuted = settings.localStorageMuted || "";
        getVolumeLocal = settings.getVolumeLocal || 1;
        getThemeDefault = settings.getThemeDefault || "Theme";

        /**
         * Cada som começa com algumas configurações específicas.
         */
        var soundSetsRef = settings.soundSettings || {}

        soundSettings = settings.soundSettings || {
            preload: soundSetsRef.preload || "auto",
            used: 0,
            volume: 0
        };

        /**
         * Os sons devem sempre começar em branco.
         */
        sounds = {};

        /**
         * Se especificado, use localStorageMuted para registrar
         * o valor de muted.
         */
        if (localStorageMuted)
        {
            muted = localStorage[localStorageMuted];
        }

        /**
         * Pré-carregar tudo !
         */
        libraryLoad();
    }

    reset(settings || {});
}
