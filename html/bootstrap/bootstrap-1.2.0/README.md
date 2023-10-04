BOOTSTRAP
=========

Bootstrap é o kit de ferramentas para iniciar CSS em sites,
aplicativos e muito mais. Inclui estilos CSS básicos para
tipografia, formulários, botões, tabelas, grids, navegação,
alertas e muito mais.

Para começar -- checkout http://www.getbootstrap.com.br/1.2.0/index.html!


Uso
---

Você pode usar o Bootstrap de duas maneiras: basta colocar o
CSS compilado em qualquer novo projeto e começar a trabalhar,
ou executar LESS em seu site e compilar instantaneamente como
um chefe.

Esta é a aparência da versão LESS:

    <link rel="stylesheet/less" type="text/css" href="less/bootstrap.less">
    <script type="text/javascript" src="less.js"></script>

Ou se preferir, o método CSS padrão:

    <link rel="stylesheet" type="text/css" href="bootstrap-1.2.0.css">

Para mais informações, consulte a documentação !


Versionamento
-------------

Para transparência e visão sobre nosso ciclo de lançamento,
e para nos esforçarmos para manter a compatibilidade com
versões anteriores, o Bootstrap será mantido sob as
diretrizes de Versionamento Semântico tanto quanto
possível.

Os lançamentos serão numerados com o seguinte formato:

`<major>.<minor>.<patch>`

E construído com as seguintes diretrizes:

* Quebrar a compatibilidade com versões anteriores prejudica o principal.
* Novas adições sem quebrar a compatibilidade com versões anteriores superam o menor.
* Correções de bugs e alterações diversas prejudicam o patch.

Para mais informações sobre o SemVer, acesse http://semver.org/.


Relatando erros
---------------

Por favor, crie um problema aqui em GitHub ! :P


Desenvolvedores
---------------

Incluímos um makefile com métodos convenientes para trabalhar
com a biblioteca bootstrap.

+ **build** - `make build`
Isso executará o compilador less na biblioteca bootstrap
e gerará um arquivo bootstrap.css e bootstrap.min.css.
O compilador lessc é necessário para que este comando
seja executado.

+ **watch** - `make watch`
Este é um método conveniente para assistir seus arquivos
less e construí-los automaticamente sempre que você
salvar. O Watchr é necessário para que este comando
seja executado.


AUTHORS
-------

**Chifrudo - chifrudo@localhost.com.br**

+ http://getbootstrap.com.br/


Copyright e License
-------------------


Copyright (C) <ano>  Chifrudo <chifrudo@localhost.com.br>

Este programa é um software livre: você pode redistribuí-lo e/ou
modificá-lo sob os termos da GNU General Public License conforme
publicada por a Free Software Foundation, seja a versão 3 da
Licença, ou (a seu critério) qualquer versão posterior.

Este programa é distribuído na esperança de que seja útil,
mas SEM QUALQUER GARANTIA; mesmo sem a garantia implícita de
COMERCIABILIDADE ou ADEQUAÇÃO PARA UM FIM ESPECÍFICO. Veja a
Licença Pública Geral GNU para mais detalhes.

Você deve ter recebido uma cópia da GNU General Public License
juntamente com este programa. Caso contrário, consulte
<https://www.gnu.org/licenses/>.
