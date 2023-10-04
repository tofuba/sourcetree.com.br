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


#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <errno.h>
#include <string.h>

#include "pes.h"


/**
 *
 */
static void report(const char *fmt, va_list params)
{
    vfprintf(stderr, fmt, params);
}

/**
 *
 */
static void die(const char *fmt, ...)
{
    va_list params;

    va_start(params, fmt);
    report(fmt, params);

    va_end(params);
    exit(1);
}

/**
 *
 */
int main(int argc, char **argv)
{
    double density = 1.0;
    int i, outputsize = -1;

    const char *output = NULL;
    struct region region;
    struct pes pes = {
        .min_x = 65535,
        .max_x = -65535,

        .min_y = 65535,
        .max_y = -65535,

        .blocks = NULL,
        .last = NULL,
    };

    for (i = 1; i < argc; i++)
    {
        const char *arg = argv[i];

        if (*arg == '-')
        {
            switch (arg[1])
            {
                case 's':
                    outputsize = atoi(argv[i+1]);
                    i++;

                    continue;

                case 'd':
                    density = atof(argv[i+1]);
                    i++;

                    continue;
            }

            die("Unknown argument '%s'\n", arg);
        }

        if (!pes.blocks)
        {
            if (read_path(arg, &region))
            {
                die("Unable to read file %s (%s)\n", arg, strerror(errno));
            }

            if (parse_pes(&region, &pes) < 0)
            {
                die("Unable to parse PES file\n");
            }

            continue;
        }

        if (!output)
        {
            output = arg;
            continue;
        }

        die("Too many arguments (%s)\n", arg);
    }

    if (!pes.blocks)
    {
        die("Requer uma entrada de arquivo PES\n");
    }

    if (!output)
    {
        die("Need a png output file name\n");
    }

    output_cairo(&pes, output, outputsize, density);

    return 0;
}
