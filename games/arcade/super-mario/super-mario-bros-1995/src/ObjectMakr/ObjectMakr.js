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
 * ObjectMakr.js.
 * Uma fábrica de objetos JavaScript derivados do Super Mario.
 */
function ObjectMakr(settings)
{
    "use strict";

    /**
     * Variáveis de membros.
     */
    var version = "1.0";

    /**
     * As configurações comum, aplicadas a todos os objetos.
     */
    var defaults;

    /**
     * Configurações para cada um dos subtipos.
     */
    var type_defaults;

    /**
     * Uma matriz associativa de tipos, como "name"=>{properties}.
     */
    var types;

    /**
     * O esboço de quais objetos herdam de onde.
     */
    var inheritance;

    /**
     * Uma função de membro opcional a ser um procedimento
     * imediatamente em objetos feitos.
     */
    var on_make;

    /**
     * Se permitido, como chamar o tipo mais alto de um objeto.
     * Esteja ciente de que isso é leitura/gravação, e a pessoa
     * final pode bagunçar as coisas !
     */
    var parent_name;

    /**
     * make("type"[, {settings}).
     * Gera uma coisa do tipo fornecido, opcionalmente com configurações
     * fornecidas pela pessoa.
     */
    this.make = function(type, settings)
    {
        if (!types.hasOwnProperty(type))
        {
            console.error("Type'" + type + "' não existe.");

            return;
        }

        var thing = {};

        /**
         * Copie as configurações comum do tipo especificado.
         */
        proliferate(thing, types[type]);

        /**
         * Substituir em qualquer configuração definida pela pessoa.
         */
        if (settings)
        {
            proliferate(thing, settings);
        }

        /**
         * Se especificado, faz o procedimento de uma função no objeto imediatamente.
         */
        if (on_make && thing[on_make])
        {
            console.log("The settings are", settings);
            thing[on_make](type, settings);
        }

        return thing;
    }

    /**
     * Simples obtém.
     */

    this.getInheritance = function()
    {
        return inheritance;
    }

    this.getDefaults = function()
    {
        return defaults;
    }

    this.getTypeDefaults = function()
    {
        return type_defaults;
    }

    /**
     * Auxiliar de proliferação.
     * Prolifera todos os objetos do doador para o destinatário.
     */
    function proliferate(recipient, donor, no_override)
    {
        var setting;
        var i;

        /**
         * Para cada atributo do doador.
         */
        for (i in donor)
        {
            /**
             * Se no_override for especificado, não substitua se já existir.
             */
            if (no_override && recipient.hasOwnProperty(i))
            {
                continue;
            }

            /**
             * Se for um objeto, recurse em uma nova versão dele.
             */
            if (typeof(setting = donor[i]) == "object")
            {
                if (!recipient.hasOwnProperty(i))
                {
                    recipient[i] = new setting.constructor();
                }

                proliferate(recipient[i], setting, no_override);
            } else
            {
                /**
                 * Primitivas regulares são fáceis de copiar de outra forma.
                 */
                recipient[i] = setting;
            }
        }

        return recipient;
    }

    /**
     * Reiniciando.
     */
    function reset(settings)
    {
        on_make = settings.on_make;
        parent_name = settings.parent_name;

        /**
         * Crie os atributos comum que cada objeto produzido terá.
         */
        defaults = {};
        proliferate(defaults, settings.defaults || {});

        /**
         * Crie os atributos iniciais para tudo.
         */
        type_defaults = {};
        proliferate(type_defaults, settings.type_defaults || {});

        /**
         * Configure os atributos de tipo comum.
         * (Normalmente, 'defaults' é a camada mais alta de tudo).
         */
        inheritance = { defaults: {} };
        types = {};
        proliferate(inheritance.defaults, settings.inheritance || {});

        /**
         * Prolifere recursivamente as heranças de tipo.
         */
        resetInheritance(defaults, inheritance, "defaults");
    }

    /**
     * Para cada tipo e todas as suas camadas mais baixas,
     * copie submissamente os atributos do tipo.
     */
    function resetInheritance(source, structure, name, parent)
    {
        var type_name;
        var type;

        for (type_name in structure)
        {
            /**
             * Verifique se o novo tipo existe.
             */
            if (!type_defaults[type_name])
            {
                type_defaults[type_name] = {};
            }

            /**
             * Copie submissamente todos eles.
             */
            proliferate(type_defaults[type_name], source, true);
            types[type_name] = type_defaults[type_name];

            /**
             * Se especificado, mantenha uma referência a camada mais alta.
             */
            if (parent_name)
            {
                type_defaults[type_name][parent_name] = parent;
            }

            /**
             * Recursão no tipo da camada mais baixa.
             */
            resetInheritance(type_defaults[type_name], structure[type_name], type_name, source);
        }
    }

    reset(settings || {});
}
