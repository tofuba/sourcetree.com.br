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
 * TableSorter 2.0 - Classificação de tabelas do lado do cliente
 * com facilidade !
 *
 * Version 2.0.13 - Copyright (c).
 */

(function($)
{
    $.extend({
        tablesorter: new function()
        {
            var parsers = [],
                widgets = [],
                tbl;

            this.defaults = {
                cssHeader: "header",
                cssAsc: "headerSortUp",
                cssDesc: "headerSortDown",
                cssChildRow: "expand-child",
                sortInitialOrder: "asc",
                sortMultiSortKey: "shiftKey",
                sortForce: null,
                sortAppend: null,
                sortLocaleCompare: false,
                textExtraction: "simple",
                parsers: {},
                widgets: [],
                widgetZebra: {
                    css: [
                        "even",
                        "odd"
                    ]
                },

                headers: {},
                widthFixed: false,
                cancelSelection: true,
                sortList: [],
                headerList: [],
                dateFormat: "us",
                onRenderHeader: null,
                selectorHeaders: "thead th",
                tableClass: "tablesorter",
                debug: false
            };

            function log(s)
            {
                if (typeof console !== "undefined" && typeof console.debug !== "undefined")
                {
                    console.log(s);
                } else
                {
                    alert(s);
                }
            }

            function benchmark(s, d)
            {
                log(s + "," + ((new Date).getTime() - d.getTime()) + "ms");
            }

            this.benchmark = benchmark;

            function getElementText(config, node, cellIndex)
            {
                var text = "",
                    te = config.textExtraction;

                if (!node)
                {
                    return "";
                }

                if (!config.supportsTextContent)
                {
                    config.supportsTextContent = node.textContent || false;
                }

                if (te === "simple")
                {
                    if (config.supportsTextContent)
                    {
                        text = node.textContent;
                    } else if (node.childNodes[0] && node.childNodes[0].hasChildNodes())
                    {
                        text = node.childNodes[0].innerHTML;
                    } else
                    {
                        text = node.innerHTML;
                    }
                } else if (typeof te === "function")
                {
                    text = te(node);
                } else if (typeof te === "object" && te.hasOwnProperty(cellIndex))
                {
                    text = te[cellIndex](node);
                } else
                {
                    text = $(node).text();
                }

                return text;
            }

            function getParserById(name)
            {
                var i,
                    l = parsers.length;

                for (i = 0; i < l; i++)
                {
                    if (parsers[i].id.toLowerCase() === name.toLowerCase())
                    {
                        return parsers[i];
                    }
                }

                return false;
            }

            function getNodeFromRowAndCellIndex(rows, rowIndex, cellIndex)
            {
                return rows[rowIndex].cells[cellIndex];
            }

            function trimAndGetNodeText(config, node, cellIndex)
            {
                return $.trim(getElementText(config, node, cellIndex));
            }

            function detectParserForColumn(table, rows, rowIndex, cellIndex)
            {
                var i,
                    l = parsers.length,
                    node = false,
                    nodeValue = "",
                    keepLooking = true;

                while (nodeValue === "" && keepLooking)
                {
                    rowIndex++;

                    if (rows[rowIndex])
                    {
                        node = getNodeFromRowAndCellIndex(rows, rowIndex, cellIndex);
                        nodeValue = trimAndGetNodeText(table.config, node, cellIndex);

                        if (table.config.debug)
                        {
                            log("Checking if value was empty on row:" + rowIndex);
                        }
                    } else
                    {
                        keepLooking = false;
                    }
                }

                for (i = 1; i < l; i++)
                {
                    if (parsers[i].is(nodeValue, table, node))
                    {
                        return parsers[i];
                    }
                }

                return parsers[0];
            }

            function buildParserCache(table, $headers)
            {
                if (table.tBodies.length === 0)
                {
                    return;
                }

                var rows = table.tBodies[0].rows,
                    list,
                    cells,
                    l,
                    i,
                    p,
                    parsersDebug = "";

                if (rows[0])
                {
                    list = [];
                    cells = rows[0].cells;
                    l = cells.length;

                    for (i = 0; i < l; i++)
                    {
                        p = false;

                        if ($.metadata && $($headers[i]).metadata() && $($headers[i]).metadata().sorter)
                        {
                            p = getParserById($($headers[i]).metadata().sorter);
                        } else if (table.config.headers[i] && table.config.headers[i].sorter)
                        {
                            p = getParserById(table.config.headers[i].sorter);
                        } else if ($($headers[i]).attr("class").match("sorter-"))
                        {
                            p = getParserById($($headers[i]).attr("class").match(/sorter-(\w+)/)[1]||"");
                        }

                        if (!p)
                        {
                            p = detectParserForColumn(table, rows, -1, i);
                        }

                        if (table.config.debug)
                        {
                            parsersDebug += "column:" + i + " parser:" + p.id + "\n";
                        }

                        list.push(p);
                    }
                }

                if (table.config.debug)
                {
                    log(parsersDebug);
                }

                return list;
            }

            function buildCache(table)
            {
                var totalRows = table.tBodies[0] && table.tBodies[0].rows.length || 0, totalCells = table.tBodies[0].rows[0] && table.tBodies[0].rows[0].cells.length || 0, parsers = table.config.parsers, cache = {row: [], normalized: []}, i, j, c, cols, cacheTime;

                if (table.config.debug)
                {
                    cacheTime = new Date;
                }

                for (i = 0; i < totalRows; ++i)
                {
                    c = $(table.tBodies[0].rows[i]);
                    cols = [];

                    if (c.hasClass(table.config.cssChildRow))
                    {
                        cache.row[cache.row.length - 1] = cache.row[cache.row.length - 1].add(c);
                        continue;
                    }

                    cache.row.push(c);

                    for (j = 0; j < totalCells; ++j)
                    {
                        cols.push(parsers[j].format(getElementText(table.config, c[0].cells[j], j), table, c[0].cells[j]));
                    }

                    cols.push(cache.normalized.length);
                    cache.normalized.push(cols);
                    cols = null
                }

                if (table.config.debug)
                {
                    benchmark("Building cache for " + totalRows + " rows:", cacheTime);
                }

                return cache;
            }

            function getWidgetById(name)
            {
                var i, l = widgets.length;

                for (i = 0; i < l; i++)
                {
                    if (widgets[i].id.toLowerCase() === name.toLowerCase())
                    {
                        return widgets[i];
                    }
                }
            }

            function applyWidget(table)
            {
                var c = table.config.widgets, i, l = c.length;

                for (i = 0; i < l; i++)
                {
                    getWidgetById(c[i]).format(table)
                }
            }

            function appendToTable(table, cache)
            {
                if (cache.row.length === 0)
                {
                    return;
                }

                var c = cache, r = c.row, n = c.normalized, totalRows = n.length, checkCell = n[0].length- 1, tableBody = $(table.tBodies[0]), rows = [], i, j, l, pos, appendTime;

                if (table.config.debug)
                {
                    appendTime = new Date;
                }

                for (i = 0; i < totalRows; i++)
                {
                    pos = n[i][checkCell];
                    rows.push(r[pos]);

                    if (!table.config.appender)
                    {
                        l = r[pos].length;

                        for (j = 0; j < l; j++)
                        {
                            tableBody[0].appendChild(r[pos][j]);
                        }
                    }
                }

                if (table.config.appender)
                {
                    table.config.appender(table, rows);
                }

                rows = null;

                if (table.config.debug)
                {
                    benchmark("Rebuilt table:", appendTime);
                }

                applyWidget(table);

                setTimeout(function()
                {
                    $(table).trigger("sortEnd", table);
                }, 0)};

                function computeTableHeaderCellIndexes(t)
                {
                    var matrix = [],
                        lookup = {},
                        thead = t.getElementsByTagName("THEAD")[0],
                        trs = thead.getElementsByTagName("TR"),
                        i,
                        j,
                        k,
                        l,
                        c,
                        cells,
                        rowIndex,
                        cellId,
                        rowSpan,
                        colSpan,
                        firstAvailCol,
                        matrixrow;

                    for (i = 0; i < trs.length; i++)
                    {
                        cells = trs[i].cells;

                        for (j = 0; j < cells.length; j++)
                        {
                            c = cells[j];
                            rowIndex = c.parentNode.rowIndex;
                            cellId = rowIndex + "-" + c.cellIndex;
                            rowSpan = c.rowSpan || 1;
                            colSpan = c.colSpan || 1;

                            if (typeof matrix[rowIndex] === "undefined")
                            {
                                matrix[rowIndex] = [];
                            }

                            for (k = 0; k < matrix[rowIndex].length + 1; k++)
                            {
                                if (typeof matrix[rowIndex][k] === "undefined")
                                {
                                    firstAvailCol = k;

                                    break;
                                }
                            }

                            lookup[cellId] = firstAvailCol;

                            for (k = rowIndex; k < rowIndex + rowSpan; k++)
                            {
                                if (typeof matrix[k] === "undefined")
                                {
                                    matrix[k] = [];
                                }

                                matrixrow = matrix[k];

                                for (l = firstAvailCol; l < firstAvailCol + colSpan; l++)
                                {
                                    matrixrow[l] = "x";
                                }
                            }
                        }
                    }

                    return lookup;
                }

                function formatSortingOrder(v)
                {
                    if (typeof v !== "number")
                    {
                        return v.toLowerCase().charAt(0) === "d" ? 1 : 0;
                    } else
                    {
                        return v === 1 ? 1 : 0;
                    }
                }

                function checkHeaderMetadata(cell)
                {
                    return $.metadata && $(cell).metadata().sorter === false;
                }

                function checkHeaderOptions(table, i)
                {
                    return table.config.headers[i] && table.config.headers[i].sorter === false;
                }

                function checkHeaderLocked(table, i)
                {
                    if (table.config.headers[i] && table.config.headers[i].lockedOrder !== null)
                    {
                        return table.config.headers[i].lockedOrder;
                    }

                    return false;
                }

                function checkHeaderOrder(table, i)
                {
                    if (table.config.headers[i] && table.config.headers[i].sortInitialOrder)
                    {
                        return table.config.headers[i].sortInitialOrder;
                    }

                    return table.config.sortInitialOrder;
                }

                function buildHeaders(table)
                {
                    var meta = $.metadata ? true : false, header_index = computeTableHeaderCellIndexes(table), $th, lock, time, $tableHeaders;

                    if (table.config.debug)
                    {
                        time = new Date;
                    }

                    $tableHeaders = $(table.config.selectorHeaders, table).wrapInner("<span/>").each(function(index)
                    {
                        this.column = header_index[this.parentNode.rowIndex + "-" + this.cellIndex];
                        this.order = formatSortingOrder(checkHeaderOrder(table, index));
                        this.count = this.order;

                        if (checkHeaderMetadata(this) || checkHeaderOptions(table, index) || $(this).is(".sorter-false"))
                        {
                            this.sortDisabled = true;
                        }

                        this.lockedOrder = false;
                        lock = checkHeaderLocked(table, index);

                        if (typeof lock !== "undefined" && lock !== false)
                        {
                            this.order = this.lockedOrder = formatSortingOrder(lock);
                        }

                        if (!this.sortDisabled)
                        {
                            $th = $(this).addClass(table.config.cssHeader);

                            if (table.config.onRenderHeader)
                            {
                                table.config.onRenderHeader.apply($th, [index]);
                            }
                        }

                        table.config.headerList[index] = this;
                    });

                    if (table.config.debug)
                    {
                        benchmark("Built headers:", time);
                        log($tableHeaders);
                    }

                    return $tableHeaders;
                }

                function checkCellColSpan(table, rows, row)
                {
                    var i, cell, arr = [], r = table.tHead.rows, c = r[row].cells;

                    for (i = 0; i < c.length; i++)
                    {
                        cell = c[i];

                        if (cell.colSpan > 1)
                        {
                            arr = arr.concat(checkCellColSpan(table, rows, row++));
                        } else if (table.tHead.length === 1 || cell.rowSpan > 1 || !r[row + 1])
                        {
                            arr.push(cell);
                        }
                    }

                    return arr;
                }

                function isValueInArray(v, a)
                {
                    var i, l = a.length;

                    for (i = 0; i < l; i++)
                    {
                        if (a[i][0] === v)
                        {
                            return true;
                        }
                    }

                    return false;
                }

                function setHeadersCss(table, $headers, list, css)
                {
                    $headers.removeClass(css[0]).removeClass(css[1]);

                    var h = [], i, l;

                    $headers.each(function(offset)
                    {
                        if (!this.sortDisabled)
                        {
                            h[this.column] = $(this);
                        }
                    });

                    l = list.length;

                    for (i = 0; i < l; i++)
                    {
                        h[list[i][0]].addClass(css[list[i][1]])
                    }
                }

                function fixColumnWidth(table, $headers)
                {
                    var c = table.config, colgroup;

                    if (c.widthFixed)
                    {
                        colgroup = $("<colgroup>");

                        $("tr:first td", table.tBodies[0]).each(function()
                        {
                            colgroup.append($("<col>").css("width", $(this).width()));
                        });

                        $(table).prepend(colgroup);
                    }
                }

                function updateHeaderSortCount(table, sortList)
                {
                    var i, s, o, c = table.config, l = sortList.length;

                    for (i = 0; i < l; i++)
                    {
                        s = sortList[i];
                        o = c.headerList[s[0]];
                        o.count = s[1];
                        o.count++;
                    }
                }

                function getCachedSortType(parsers, i)
                {
                    return parsers[i].type;
                }

                function multisort(table, sortList, cache)
                {
                    if (cache.row.length === 0)
                    {
                        return cache;
                    }

                    var dynamicExp = "var sortWrapper = function(a,b) {", col, mx = 0, dir = 0, tc = table.config, lc = cache.normalized.length, l = sortList.length, sortTime, i, j, c, s, e, order, orgOrderCol;

                    if (tc.debug)
                    {
                        sortTime = new Date;
                    }

                    for (i = 0; i < l; i++)
                    {
                        c = sortList[i][0];
                        order = sortList[i][1];
                        s = getCachedSortType(tc.parsers, c) === "text" ? order === 0 ? "sortText" : "sortTextDesc" : order === 0 ? "sortNumeric" : "sortNumericDesc";
                        e = "e" + i;

                        if (/Numeric/.test(s) && tc.headers[c] && tc.headers[c].string)
                        {
                            for (j = 0; j < lc; j++)
                            {
                                col = Math.abs(parseFloat(cache.normalized[j][c]));
                                mx = Math.max(mx, isNaN(col) ? 0 : col);
                            }

                            dir = tc.headers[c] ? tc.string[tc.headers[c].string] || 0 : 0;
                        }

                        dynamicExp += "var " + e + " = " + s + "(a[" + c + "],b[" + c + "]," + mx + "," + dir + "); ";
                        dynamicExp += "if (" + e + ") { return " + e + "; } ";
                        dynamicExp += "else { ";
                    }

                    orgOrderCol = cache.normalized[0].length - 1;
                    dynamicExp += "return a[" + orgOrderCol + "]-b[" + orgOrderCol + "];";

                    for (i = 0; i < l; i++)
                    {
                        dynamicExp += "}; ";
                    }

                    dynamicExp += "return 0; ";
                    dynamicExp += "}; ";

                    eval(dynamicExp);

                    cache.normalized.sort(sortWrapper);

                    if (tc.debug)
                    {
                        benchmark("Sorting on " + sortList.toString() + " and dir " + order + " time:", sortTime);
                    }

                    return cache;
                }

                function sortText(a, b)
                {
                    if ($.data(tbl[0], "tablesorter").sortLocaleCompare)
                    {
                        return a.localeCompare(b);
                    }

                    if (a === b)
                    {
                        return 0;
                    }

                    try
                    {
                        var cnt = 0, ax, t, x = /^(\.)?\d/, L = Math.min(a.length, b.length) + 1;

                        while (cnt < L && a.charAt(cnt) === b.charAt(cnt) && x.test(b.substring(cnt)) === false && x.test(a.substring(cnt)) === false)
                        {
                            cnt++;
                        }

                        a = a.substring(cnt);
                        b = b.substring(cnt);

                        if (x.test(a) || x.test(b))
                        {
                            if (x.test(a) === false)
                            {
                                return a ? 1 : -1;
                            } else if (x.test(b) === false)
                            {
                                return b ? -1 : 1;
                            } else
                            {
                                t = parseFloat(a) - parseFloat(b);

                                if (t !== 0)
                                {
                                    return t;
                                } else
                                {
                                    t = a.search(/[^\.\d]/);
                                }

                                if (t === -1)
                                {
                                    t = b.search(/[^\.\d]/);
                                }

                                a = a.substring(t);
                                b = b.substring(t);
                            }
                        }

                        return a > b ? 1 : -1;
                    } catch(er)
                    {
                        return 0;
                    }
                }

                function sortTextDesc(a, b)
                {
                    if ($.data(tbl[0], "tablesorter").sortLocaleCompare)
                    {
                        return b.localeCompare(a);
                    }

                    return - sortText(a, b);
                }

                function getTextValue(a, mx, d)
                {
                    if (a === "")
                    {
                        return (d || 0)*Number.MAX_VALUE;
                    }

                    if (mx)
                    {
                        var i, l = a.length, n = mx + d;

                        for (i = 0; i < l; i++)
                        {
                            n += a.charCodeAt(i);
                        }

                        return d*n;
                    }

                    return 0;
                }

                function sortNumeric(a, b, mx, d)
                {
                    if (a === "" || isNaN(a))
                    {
                        a = getTextValue(a, mx, d);
                    }

                    if (b === "" || isNaN(b))
                    {
                        b = getTextValue(b, mx, d);
                    }

                    return a - b;
                }

                function sortNumericDesc(a, b, mx, d)
                {
                    if (a === "" || isNaN(a))
                    {
                        a = getTextValue(a, mx, d);
                    }

                    if (b === "" || isNaN(b))
                        b = getTextValue(b, mx, d);

                    return b - a;
                }

                this.construct = function(settings)
                {
                    return this.each(function()
                    {
                        if (!this.tHead || !this.tBodies)
                        {
                            return;
                        }

                        var $this,
                            $document,
                            $headers,
                            cache,
                            config,
                            shiftDown = 0,
                            sortOrder,
                            sortCSS,
                            totalRows,
                            $cell,
                            i,
                            j,
                            a,
                            s,
                            o;

                        this.config = {};
                        config = $.extend(this.config, $.tablesorter.defaults, settings);
                        tbl = $this = $(this).addClass(this.config.tableClass);
                        $.data(this, "tablesorter", config);
                        $headers = buildHeaders(this);

                        this.config.parsers = buildParserCache(this, $headers);
                        this.config.string = {max: 1, "max+": 1, "max-": -1, none: 0};

                        cache = buildCache(this);
                        sortCSS = [
                            config.cssDesc,
                            config.cssAsc
                        ];

                        fixColumnWidth(this);

                        $headers.click(function(e)
                        {
                            totalRows = $this[0].tBodies[0] && $this[0].tBodies[0].rows.length || 0;

                            if (!this.sortDisabled && totalRows > 0)
                            {
                                $this.trigger("sortStart", tbl[0]);
                                $cell = $(this);
                                i = this.column;
                                this.order = this.count++ % 2;

                                if (typeof this.lockedOrder !== "undefined" && this.lockedOrder !== false)
                                {
                                    this.order = this.lockedOrder;
                                }

                                if (!e[config.sortMultiSortKey])
                                {
                                    config.sortList = [];

                                    if (config.sortForce !== null)
                                    {
                                        a = config.sortForce;

                                        for (j = 0; j < a.length; j++)
                                        {
                                            if (a[j][0] !== i)
                                            {
                                                config.sortList.push(a[j]);
                                            }
                                        }
                                    }

                                    config.sortList.push([i, this.order]);
                                } else if (isValueInArray(i, config.sortList))
                                {
                                    for(j = 0; j < config.sortList.length; j++)
                                    {
                                        s = config.sortList[j];
                                        o = config.headerList[s[0]];

                                        if (s[0] === i)
                                        {
                                            o.count = s[1];
                                            o.count++;

                                            s[1] = o.count % 2;
                                        }
                                    }
                                } else
                                {
                                    config.sortList.push([i, this.order]);
                                }

                                if (config.sortAppend !== null)
                                {
                                    a = config.sortAppend;

                                    for (j = 0; j < a.length; j++)
                                    {
                                        if (a[j][0] !== i)
                                        {
                                            config.sortList.push(a[j]);
                                        }
                                    }
                                }

                                setTimeout(function()
                                {
                                    setHeadersCss($this[0], $headers, config.sortList, sortCSS);
                                    appendToTable($this[0], multisort($this[0], config.sortList, cache));
                                }, 1);

                                return false;
                            }
                        }).mousedown(function()
                        {
                            if (config.cancelSelection)
                            {
                                this.onselectstart = function()
                                {
                                    return false;
                                };

                                return false;
                            }
                        });

                        $this.bind("update", function()
                        {
                            var me = this;

                            setTimeout(function()
                            {
                                me.config.parsers = buildParserCache(me, $headers);
                                cache = buildCache(me);
                            }, 1);
                        }).bind("updateCell", function(e, cell)
                        {
                            var config = this.config, pos = [cell.parentNode.rowIndex - 1, cell.cellIndex];

                            cache.normalized[pos[0]][pos[1]] = config.parsers[pos[1]].format(getElementText(config, cell, pos[1]), cell);
                        }).bind("sorton", function(e, list)
                        {
                            $(this).trigger("sortStart", tbl[0]);
                            config.sortList = list;

                            var sortList = config.sortList;

                            updateHeaderSortCount(this, sortList);
                            setHeadersCss(this, $headers, sortList, sortCSS);
                            appendToTable(this, multisort(this, sortList, cache))
                        }).bind("appendCache", function()
                        {
                            appendToTable(this,cache);
                        }).bind("applyWidgetId", function(e, id)
                        {
                            getWidgetById(id).format(this);
                        }).bind("applyWidgets", function()
                        {
                            applyWidget(this);
                        });

                        if ($.metadata && $(this).metadata() && $(this).metadata().sortlist)
                        {
                            config.sortList = $(this).metadata().sortlist;
                        }

                        if (config.sortList.length > 0)
                        {
                            $this.trigger("sorton", [config.sortList]);
                        }

                        applyWidget(this);
                    });
                };

                this.addParser = function(parser)
                {
                    var i, l = parsers.length, a = true;

                    for (i = 0; i < l; i++)
                    {
                        if (parsers[i].id.toLowerCase() === parser.id.toLowerCase())
                        {
                            a = false;
                        }
                    }

                    if (a)
                    {
                        parsers.push(parser);
                    }
                };

                this.addWidget = function(widget)
                {
                    widgets.push(widget);
                };

                this.formatFloat = function(s)
                {
                    var i = parseFloat(s);

                    return isNaN(i) ? $.trim(s) : i;
                };

                this.isDigit = function(s)
                {
                    return /^[\-+]?\d*$/.test($.trim(s.replace(/[,.']/g,"")));
                };

                this.clearTableBody = function(table)
                {
                    if ($.browser.msie)
                    {
                        var empty = function()
                        {
                            while (this.firstChild)
                            {
                                this.removeChild(this.firstChild);
                            }
                        };

                        empty.apply(table.tBodies[0]);
                    } else
                    {
                        table.tBodies[0].innerHTML = "";
                    }
                }
            }
        })();

        $.fn.extend({tablesorter:$.tablesorter.construct});

        var ts = $.tablesorter;
            ts.addParser({
                id: "text",
                is: function(s)
                {
                    return true;
                },

                format: function(s)
                {
                    return $.trim(s.toLocaleLowerCase());
                }, type:"text"});

            ts.addParser({
                id: "digit",
                is: function(s)
                {
                    return $.tablesorter.isDigit(s.replace(/,/g, ""));
                },

                format: function(s)
                {
                    return $.tablesorter.formatFloat(s.replace(/,/g, ""));
                }, type:"numeric"});

            ts.addParser({
                id: "currency",
                is: function(s)
                {
                    return /^[\u00a3$\u20ac\u00a4\u00a5\u00a2?.]/.test(s);
                },

                format: function(s)
                {
                    return $.tablesorter.formatFloat(s.replace(new RegExp(/[^0-9.\-]/g), ""));
                }, type:"numeric"});

            ts.addParser({
                id: "ipAddress",
                is: function(s)
                {
                    return /^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);
                },

                format: function(s)
                {
                    var i, item, a = s.split("."), r = "", l = a.length;

                    for (i = 0; i < l; i++)
                    {
                        item = a[i];

                        if (item.length === 2)
                        {
                            r += "0" + item;
                        } else
                        {
                            r += item;
                        }
                    }

                    return $.tablesorter.formatFloat(r);
                }, type: "numeric"});

            ts.addParser({
                id: "url",
                is: function(s)
                {
                    return /^(https?|ftp|file):\/\/$/.test(s);
                },

                format: function(s)
                {
                    return $.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//), ""));
                }, type:"text"});

            ts.addParser({
                id: "isoDate",
                is: function(s)
                {
                    return /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(s);
                },

                format: function(s)
                {
                    return $.tablesorter.formatFloat(s !== "" ? (new Date(s.replace(new RegExp(/-/g), "/"))).getTime() : "0");
                }, type:"numeric"});

            ts.addParser({
                id: "percent",
                is: function(s)
                {
                    return /\%$/.test($.trim(s));
                },

                format: function(s)
                {
                    return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g), ""));
                }, type:"numeric"});

            ts.addParser({
                id: "usLongDate",
                is: function(s)
                {
                    return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));
                },

                format: function(s)
                {
                    return $.tablesorter.formatFloat((new Date(s)).getTime());
                }, type: "numeric"});

            ts.addParser({
                id: "shortDate",
                is: function(s)
                {
                    return /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);
                },

                format: function(s, table)
                {
                    var c = table.config;
                        s = s.replace(/\-/g, "/");

                    if (c.dateFormat === "us")
                    {
                        s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");
                    } else if (c.dateFormat === "uk")
                    {
                        s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");
                    } else if (c.dateFormat === "dd/mm/yy" || c.dateFormat === "dd-mm-yy")
                    {
                        s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");
                    }

                    return $.tablesorter.formatFloat((new Date(s)).getTime());
                }, type:"numeric"});

            ts.addParser({
                id: "time",
                is: function(s)
                {
                    return /^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);
                },

                format: function(s)
                {
                    return $.tablesorter.formatFloat((new Date("2000/01/01 "+s)).getTime());
                }, type:"numeric"});

            ts.addParser({
                id: "metadata",
                is: function(s)
                {
                    return false;
                },

                format: function(s, table, cell)
                {
                    var c = table.config,
                        p = !c.parserMetadataName ? "sortValue" : c.parserMetadataName;

                    return $(cell).metadata()[p];
                }, type:"numeric"});

            ts.addWidget({
                id: "zebra",
                format: function(table)
                {
                    var $tr, row = -1, odd, time;

                    if (table.config.debug)
                    {
                        time = new Date;
                    }

                    $("tr:visible", table.tBodies[0]).each(function(i)
                    {
                        $tr = $(this);

                        if (!$tr.hasClass(table.config.cssChildRow))
                        {
                            row++;
                        }

                        odd = row % 2 === 0;

                        $tr.removeClass(table.config.widgetZebra.css[odd ? 0 : 1]).addClass(table.config.widgetZebra.css[odd ? 1 : 0]);
                    });

                    if (table.config.debug)
                    {
                        $.tablesorter.benchmark("Applying Zebra widget", time);
                    }
                }
    });
})(jQuery);
