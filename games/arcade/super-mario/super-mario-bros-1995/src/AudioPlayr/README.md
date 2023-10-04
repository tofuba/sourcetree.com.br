AudioPlayr.js
==============

Uma biblioteca de áudio derivada de Super Mario.
Esta biblioteca pré-carrega e fornece funções para reproduzir um conjunto de sons

------------------------------------------------------------------------------------

Funções essenciais
------------------

<table>
    <tr>
        <th>
            Código
        </th>
        <th>
            Saída
        </th>
    </tr>
    <tr>
        <td>
            <code>
                window.MyAudioPlayer = new AudioPlayr({</code><br><code>
                  directory: "Sounds",</code><br><code>
                  library: {</code><br><code>
                    Sounds: [</code><br><code>
                      "MySound",</code><br><code>
                      "MyOtherSound"</code><br><code>
                    ],</code><br><code>
                    Themes: [ "MyThemeSong" ]</code><br><code>
                  }</code><br><code>
                });</code><br><code>
            </code>
        </td>
        <td>
            <em>
                Cria uma nova instância do reprodutor de áudio que procura os arquivos de
                áudio que serão carregados "MySound" e "MyOtherSound" da pasta "Sounds", e
                "MyThemeSong" do diretório de Temas.
            </em>
            <br>
            <em>
                Por padrão, as extensões marcadas são '.mp3' e '.ogg', então eles serão
                procurados em "Sounds/mp3/*.mp3" e "Sounds/ogg/*.mp3" (e "Themes/...").
            </em>
        </td>
    </tr>
    <tr>
        <td>
            <code>
                MyAudioPlayer.play("MySound");
            </code>
        </td>
        <td>
            <em>"MySound.mp3" ou "MySound.ogg" será jogado uma vez.</em>
        </td>
    </tr>
    <tr>
        <td>
            <code>
                MyAudioPlayer.playTheme("MyThemeSong");
            </code>
        </td>
        <td>
            <em>
                "MyThemeSong.mp3" ou "MyThemeSong.ogg" será reproduzido em loop.
            </em>
        </td>
    </tr>
    <tr>
        <td>
            <code>
                MyAudioPlayer.pause();</code><br><code>
                MyAudioPlayer.resume();
            </code>
        </td>
        <td>
            <em>
                Pausa todos os sons e imediatamente retoma a reprodução do tema.
            </em>
        </td>
    </tr>
    <tr>
        <td>
            <code>
                MyAudioPlayer.pauseTheme();</code><br><code>
                MyAudioPlayer.resumeTheme();
            </code>
        </td>
        <td>
            <em>
                Pausa a música-tema atual e imediatamente a reproduz.
            </em>
        </td>
    </tr>
    <tr>
        <td>
            <code>
                MyAudioPlayer.toggleMute();
            </code>
        </td>
        <td>
            <em>
                Silencia ou ativa todos os sons atuais. Se localStorageMuted for especificado,
                ele salvará esse valor em <code>localStorage[localStorageMuted]</code>.
            </em>
        </td>
    </tr>
</table>
