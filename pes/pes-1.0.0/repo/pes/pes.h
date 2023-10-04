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


#ifndef PES_H
#define PES_H

    /**
     *
     */
    struct region {
        /**
         *
         */
        const void *ptr;

        /**
         *
         */
        unsigned int size;
    };

    /**
     *
     */
    struct color {
        /**
         *
         */
        const char *name;

        /**
         *
         */
        unsigned char r, g, b;
    };

    /**
     *
     */
    struct stitch {
        /**
         *
         */
        int x;

        /**
         *
         */
        int y;

        /**
         *
         */
        int jumpstitch;
    };

    /**
     *
     */
    struct pes_block {
        /**
         *
         */
        struct pes_block *next;

        /**
         *
         */
        struct color *color;

        /**
         *
         */
        int nr_stitches, max_stitches;

        /**
         *
         */
        struct stitch *stitch;
    };

    /**
     *
     */
    struct pes {
        /**
         *
         */
        int nr_colors;

        /**
         *
         */
        int min_x;

        /**
         *
         */
        int max_x;

        /**
         *
         */
        int min_y;

        /**
         *
         */
        int max_y;

        /**
         *
         */
        struct pes_block *blocks, *last;
    };

    /**
     * Entrada.
     */

    /**
     *
     */
    int read_file(int fd, struct region *region);

    /**
     *
     */
    int read_path(const char *path, struct region *region);

    /**
     *
     */
    int parse_pes(struct region *region, struct pes *pes);

    /**
     * Saída.
     */

    /**
     *
     */
    void output_svg(struct pes *pes);

    /**
     *
     */
    void output_png(struct pes *pes);

    /**
     *
     */
    void output_cairo(struct pes *pes, const char *filename, int size, double density);

#endif
