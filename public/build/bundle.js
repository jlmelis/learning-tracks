
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function createTracks() {
    	const { subscribe, set, update } = writable(
    		[
    			{
    				id: 0,
    				name: 'Svelte',
    				description: 'Learning svelte',
    				links: [
    					{
    						id: 0,
    						title: 'Official tutorial',
    						href: 'https://svelte.dev/tutorial/basics'
    					},
    					{
    						id: 1,
    						title: 'Scotch IO',
    						href: 'https://svelte.dev/tutorial/basics'
    					}
    				]
    			},
    			{
    				id: 1,
    				name: 'Node',
    				description: 'learning node',
    				links: [
    					{
    						id: 0,
    						title: 'W3 Schools',
    						href: 'https://www.w3schools.com/nodejs/'
    					}
    				]
    			},	
    		]
    	);

    	return {
    		subscribe,
    		set,
    		useLocalStorage: () => {
    			const json = localStorage.getItem('tracks');
    			
    			if (json) {
    				set(JSON.parse(json));
    			}

    			subscribe(current => {
    				localStorage.setItem('tracks', JSON.stringify(current));
    			});
    		},
    		addNew: (name) => update(n => [...n, {
    			id: n.length,
    			name: name, 
    			description: 'learn something new!', 
    			links: []}]),
    		removeTrack: (id) => update(n => n.filter(t => t.id !== id)),
    		updateTrack: (track) => update(n => n.map(t => t.id === track.id ? track : t))
    	}
    }

    const tracks = createTracks();

    function selectTextOnFocus(node) {
      
        const handleFocus = event => {
          node && typeof node.select === 'function' && node.select();
        };
        
        node.addEventListener('focus', handleFocus);
        
        return {
          destroy() {
            node.removeEventListener('focus', handleFocus);
          }
        }
      }

    /* src/components/Track.svelte generated by Svelte v3.19.2 */
    const file = "src/components/Track.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (75:2) {:else}
    function create_else_block(ctx) {
    	let div;
    	let span0;
    	let t0_value = /*track*/ ctx[0].name + "";
    	let t0;
    	let t1;
    	let span1;
    	let t2;
    	let t3_value = /*track*/ ctx[0].description + "";
    	let t3;
    	let t4;
    	let t5;
    	let button0;
    	let i0;
    	let t6;
    	let button1;
    	let i1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text("(");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t6 = space();
    			button1 = element("button");
    			i1 = element("i");
    			add_location(span0, file, 76, 4, 1838);
    			add_location(span1, file, 77, 4, 1868);
    			attr_dev(i0, "class", "iconify");
    			attr_dev(i0, "data-icon", "fa-solid:pencil-alt");
    			attr_dev(i0, "data-inline", "false");
    			add_location(i0, file, 79, 5, 1969);
    			attr_dev(button0, "class", "button is-small");
    			add_location(button0, file, 78, 4, 1908);
    			attr_dev(i1, "class", "iconify");
    			attr_dev(i1, "data-icon", "fa-solid:trash");
    			attr_dev(i1, "data-inline", "false");
    			add_location(i1, file, 84, 5, 2138);
    			attr_dev(button1, "class", "button is-small");
    			add_location(button1, file, 83, 4, 2077);
    			add_location(div, file, 75, 3, 1828);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    			append_dev(span1, t3);
    			append_dev(span1, t4);
    			append_dev(div, t5);
    			append_dev(div, button0);
    			append_dev(button0, i0);
    			append_dev(div, t6);
    			append_dev(div, button1);
    			append_dev(button1, i1);

    			dispose = [
    				listen_dev(button0, "click", /*editTrack*/ ctx[6], false, false, false),
    				listen_dev(button1, "click", /*removeTrack*/ ctx[5], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*track*/ 1 && t0_value !== (t0_value = /*track*/ ctx[0].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*track*/ 1 && t3_value !== (t3_value = /*track*/ ctx[0].description + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(75:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:2) {#if edit}
    function create_if_block_1(ctx) {
    	let div;
    	let input0;
    	let selectTextOnFocus_action;
    	let t0;
    	let input1;
    	let selectTextOnFocus_action_1;
    	let t1;
    	let button;
    	let i;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			button = element("button");
    			i = element("i");
    			attr_dev(input0, "class", "input");
    			add_location(input0, file, 60, 4, 1374);
    			attr_dev(input1, "class", "input");
    			add_location(input1, file, 64, 4, 1508);
    			attr_dev(i, "class", "iconify");
    			attr_dev(i, "data-icon", "fa-solid:check");
    			attr_dev(i, "data-inline", "false");
    			add_location(i, file, 69, 5, 1703);
    			attr_dev(button, "class", "button");
    			add_location(button, file, 68, 4, 1649);
    			add_location(div, file, 59, 3, 1364);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			/*input0_binding*/ ctx[13](input0);
    			set_input_value(input0, /*track*/ ctx[0].name);
    			append_dev(div, t0);
    			append_dev(div, input1);
    			/*input1_binding*/ ctx[15](input1);
    			set_input_value(input1, /*track*/ ctx[0].description);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, i);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[14]),
    				listen_dev(input0, "keydown", /*onEnter*/ ctx[10], false, false, false),
    				action_destroyer(selectTextOnFocus_action = selectTextOnFocus.call(null, input0)),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[16]),
    				listen_dev(input1, "keydown", /*onEnter*/ ctx[10], false, false, false),
    				action_destroyer(selectTextOnFocus_action_1 = selectTextOnFocus.call(null, input1)),
    				listen_dev(button, "click", /*updateTrack*/ ctx[7], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*track*/ 1 && input0.value !== /*track*/ ctx[0].name) {
    				set_input_value(input0, /*track*/ ctx[0].name);
    			}

    			if (dirty & /*track*/ 1 && input1.value !== /*track*/ ctx[0].description) {
    				set_input_value(input1, /*track*/ ctx[0].description);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input0_binding*/ ctx[13](null);
    			/*input1_binding*/ ctx[15](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(59:2) {#if edit}",
    		ctx
    	});

    	return block;
    }

    // (103:1) {#if track.links}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*track*/ ctx[0].links;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*removeLink, track*/ 513) {
    				each_value = /*track*/ ctx[0].links;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(103:1) {#if track.links}",
    		ctx
    	});

    	return block;
    }

    // (104:2) {#each track.links as link}
    function create_each_block(ctx) {
    	let div;
    	let a;
    	let t0_value = /*link*/ ctx[19].title + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let button;
    	let i;
    	let t2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			button = element("button");
    			i = element("i");
    			t2 = space();
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[19].href);
    			add_location(a, file, 105, 4, 2701);
    			attr_dev(i, "class", "iconify");
    			attr_dev(i, "data-icon", "fa-solid:trash");
    			attr_dev(i, "data-inline", "false");
    			add_location(i, file, 107, 5, 2813);
    			attr_dev(button, "class", "button is-small");
    			add_location(button, file, 106, 4, 2744);
    			attr_dev(div, "class", "panel-block");
    			add_location(div, file, 104, 3, 2671);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, i);
    			append_dev(div, t2);

    			dispose = listen_dev(
    				button,
    				"click",
    				function () {
    					if (is_function(/*removeLink*/ ctx[9](/*link*/ ctx[19].id))) /*removeLink*/ ctx[9](/*link*/ ctx[19].id).apply(this, arguments);
    				},
    				false,
    				false,
    				false
    			);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*track*/ 1 && t0_value !== (t0_value = /*link*/ ctx[19].title + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*track*/ 1 && a_href_value !== (a_href_value = /*link*/ ctx[19].href)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(104:2) {#each track.links as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let input0;
    	let t1;
    	let input1;
    	let t2;
    	let button;
    	let i;
    	let t3;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*edit*/ ctx[1]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*track*/ ctx[0].links && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			input0 = element("input");
    			t1 = space();
    			input1 = element("input");
    			t2 = space();
    			button = element("button");
    			i = element("i");
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "panel-heading");
    			add_location(div0, file, 57, 1, 1320);
    			attr_dev(input0, "class", "input");
    			attr_dev(input0, "placeholder", "title");
    			add_location(input0, file, 93, 3, 2315);
    			attr_dev(input1, "class", "input");
    			attr_dev(input1, "placeholder", "url");
    			add_location(input1, file, 94, 3, 2385);
    			attr_dev(i, "class", "iconify");
    			attr_dev(i, "data-icon", "fa-solid:plus");
    			attr_dev(i, "data-inline", "false");
    			add_location(i, file, 96, 4, 2507);
    			attr_dev(button, "class", "button is-small");
    			add_location(button, file, 95, 3, 2451);
    			attr_dev(div1, "class", "level");
    			add_location(div1, file, 92, 2, 2292);
    			attr_dev(div2, "class", "panel-block");
    			add_location(div2, file, 91, 1, 2264);
    			attr_dev(div3, "class", "panel");
    			add_location(div3, file, 56, 0, 1290);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			if_block0.m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*linkTitle*/ ctx[3]);
    			append_dev(div1, t1);
    			append_dev(div1, input1);
    			set_input_value(input1, /*linkUrl*/ ctx[4]);
    			append_dev(div1, t2);
    			append_dev(div1, button);
    			append_dev(button, i);
    			append_dev(div3, t3);
    			if (if_block1) if_block1.m(div3, null);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[17]),
    				listen_dev(input1, "input", /*input1_input_handler_1*/ ctx[18]),
    				listen_dev(button, "click", /*addLink*/ ctx[8], false, false, false),
    				listen_dev(div3, "click", /*click_handler*/ ctx[12], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (dirty & /*linkTitle*/ 8 && input0.value !== /*linkTitle*/ ctx[3]) {
    				set_input_value(input0, /*linkTitle*/ ctx[3]);
    			}

    			if (dirty & /*linkUrl*/ 16 && input1.value !== /*linkUrl*/ ctx[4]) {
    				set_input_value(input1, /*linkUrl*/ ctx[4]);
    			}

    			if (/*track*/ ctx[0].links) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { track } = $$props;
    	let edit;
    	let nameInput;
    	let linkTitle;
    	let linkUrl;
    	const dispatch = createEventDispatcher();

    	function removeTrack() {
    		dispatch("removeTrack", { id: track.id });
    	}

    	async function editTrack() {
    		$$invalidate(1, edit = true);

    		// using tick to wait for the input to be shown
    		await tick();

    		nameInput.focus();
    	}

    	function updateTrack() {
    		tracks.updateTrack(track);
    		$$invalidate(1, edit = false);
    	}

    	function addLink() {
    		// TODO: is this causing two renders?
    		// look into possibility of using storefunction to update store
    		// as opposed to updating item then updating store.
    		$$invalidate(
    			0,
    			track.links = [
    				...track.links,
    				{
    					id: track.links.length + 1,
    					title: linkTitle,
    					url: linkUrl
    				}
    			],
    			track
    		);

    		tracks.updateTrack(track);
    		$$invalidate(3, linkTitle = "");
    		$$invalidate(4, linkUrl = "");
    	}

    	function removeLink(id) {
    		// TODO: is this causing two renders?
    		// look into possibility of using storefunction to update store
    		// as opposed to updating item then updating store.
    		$$invalidate(0, track.links = track.links.filter(t => t.id != id), track);

    		tracks.updateTrack(track);
    	}

    	function onEnter(event) {
    		if (event.key === "Enter") {
    			updateTrack();
    		}
    	}

    	const writable_props = ["track"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Track> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Track", $$slots, []);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, nameInput = $$value);
    		});
    	}

    	function input0_input_handler() {
    		track.name = this.value;
    		$$invalidate(0, track);
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(2, nameInput = $$value);
    		});
    	}

    	function input1_input_handler() {
    		track.description = this.value;
    		$$invalidate(0, track);
    	}

    	function input0_input_handler_1() {
    		linkTitle = this.value;
    		$$invalidate(3, linkTitle);
    	}

    	function input1_input_handler_1() {
    		linkUrl = this.value;
    		$$invalidate(4, linkUrl);
    	}

    	$$self.$set = $$props => {
    		if ("track" in $$props) $$invalidate(0, track = $$props.track);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		createEventDispatcher,
    		tracks,
    		selectTextOnFocus,
    		track,
    		edit,
    		nameInput,
    		linkTitle,
    		linkUrl,
    		dispatch,
    		removeTrack,
    		editTrack,
    		updateTrack,
    		addLink,
    		removeLink,
    		onEnter
    	});

    	$$self.$inject_state = $$props => {
    		if ("track" in $$props) $$invalidate(0, track = $$props.track);
    		if ("edit" in $$props) $$invalidate(1, edit = $$props.edit);
    		if ("nameInput" in $$props) $$invalidate(2, nameInput = $$props.nameInput);
    		if ("linkTitle" in $$props) $$invalidate(3, linkTitle = $$props.linkTitle);
    		if ("linkUrl" in $$props) $$invalidate(4, linkUrl = $$props.linkUrl);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		track,
    		edit,
    		nameInput,
    		linkTitle,
    		linkUrl,
    		removeTrack,
    		editTrack,
    		updateTrack,
    		addLink,
    		removeLink,
    		onEnter,
    		dispatch,
    		click_handler,
    		input0_binding,
    		input0_input_handler,
    		input1_binding,
    		input1_input_handler,
    		input0_input_handler_1,
    		input1_input_handler_1
    	];
    }

    class Track extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { track: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Track",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*track*/ ctx[0] === undefined && !("track" in props)) {
    			console.warn("<Track> was created without expected prop 'track'");
    		}
    	}

    	get track() {
    		throw new Error("<Track>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set track(value) {
    		throw new Error("<Track>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TrackSummary.svelte generated by Svelte v3.19.2 */

    const file$1 = "src/components/TrackSummary.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*name*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			t2 = text(/*description*/ ctx[1]);
    			add_location(span, file$1, 28, 8, 404);
    			add_location(div0, file$1, 27, 4, 390);
    			attr_dev(div1, "class", "desription svelte-1bl8hev");
    			add_location(div1, file$1, 30, 4, 439);
    			attr_dev(div2, "class", "summary svelte-1bl8hev");
    			toggle_class(div2, "active", /*active*/ ctx[2]);
    			add_location(div2, file$1, 26, 0, 341);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, t2);
    			dispose = listen_dev(div2, "click", /*click_handler*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1) set_data_dev(t0, /*name*/ ctx[0]);
    			if (dirty & /*description*/ 2) set_data_dev(t2, /*description*/ ctx[1]);

    			if (dirty & /*active*/ 4) {
    				toggle_class(div2, "active", /*active*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { id } = $$props;
    	let { name } = $$props;
    	let { description } = $$props;
    	let { active } = $$props;
    	const writable_props = ["id", "name", "description", "active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TrackSummary> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TrackSummary", $$slots, []);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({ id, name, description, active });

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, description, active, id, click_handler];
    }

    class TrackSummary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			id: 3,
    			name: 0,
    			description: 1,
    			active: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TrackSummary",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[3] === undefined && !("id" in props)) {
    			console.warn("<TrackSummary> was created without expected prop 'id'");
    		}

    		if (/*name*/ ctx[0] === undefined && !("name" in props)) {
    			console.warn("<TrackSummary> was created without expected prop 'name'");
    		}

    		if (/*description*/ ctx[1] === undefined && !("description" in props)) {
    			console.warn("<TrackSummary> was created without expected prop 'description'");
    		}

    		if (/*active*/ ctx[2] === undefined && !("active" in props)) {
    			console.warn("<TrackSummary> was created without expected prop 'active'");
    		}
    	}

    	get id() {
    		throw new Error("<TrackSummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<TrackSummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<TrackSummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<TrackSummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<TrackSummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<TrackSummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<TrackSummary>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<TrackSummary>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.19.2 */
    const file$2 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (59:1) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let input;
    	let t0;
    	let span;
    	let i;
    	let t1;
    	let t2;
    	let current;
    	let dispose;
    	let if_block = /*search*/ ctx[1].length > 0 && create_if_block_1$1(ctx);
    	let each_value = /*filteredTracks*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p = element("p");
    			input = element("input");
    			t0 = space();
    			span = element("span");
    			i = element("i");
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "class", "input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "filter or create new");
    			add_location(input, file$2, 62, 5, 1432);
    			attr_dev(i, "class", "iconify");
    			attr_dev(i, "data-icon", "fa-solid:search");
    			attr_dev(i, "data-inline", "false");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file$2, 67, 6, 1581);
    			attr_dev(span, "class", "icon is-left");
    			add_location(span, file$2, 66, 5, 1547);
    			attr_dev(p, "class", "control has-icons-left");
    			add_location(p, file$2, 61, 4, 1392);
    			attr_dev(div0, "class", "panel-heading");
    			add_location(div0, file$2, 60, 3, 1360);
    			attr_dev(div1, "class", "panel");
    			add_location(div1, file$2, 59, 2, 1337);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, input);
    			set_input_value(input, /*search*/ ctx[1]);
    			append_dev(p, t0);
    			append_dev(p, span);
    			append_dev(span, i);
    			append_dev(div0, t1);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[8]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*search*/ 2 && input.value !== /*search*/ ctx[1]) {
    				set_input_value(input, /*search*/ ctx[1]);
    			}

    			if (/*search*/ ctx[1].length > 0) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*filteredTracks, selectedTrack, selectTrack*/ 37) {
    				each_value = /*filteredTracks*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(59:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (51:1) {#if selectedTrack}
    function create_if_block$1(ctx) {
    	let div;
    	let button;
    	let t1;
    	let current;
    	let dispose;

    	const track = new Track({
    			props: { track: /*selectedTrack*/ ctx[0] },
    			$$inline: true
    		});

    	track.$on("removeTrack", /*removeTrack*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Pick track";
    			t1 = space();
    			create_component(track.$$.fragment);
    			attr_dev(button, "class", "button");
    			add_location(button, file$2, 52, 3, 1155);
    			add_location(div, file$2, 51, 2, 1146);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(div, t1);
    			mount_component(track, div, null);
    			current = true;
    			dispose = listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			const track_changes = {};
    			if (dirty & /*selectedTrack*/ 1) track_changes.track = /*selectedTrack*/ ctx[0];
    			track.$set(track_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(track.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(track.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(track);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(51:1) {#if selectedTrack}",
    		ctx
    	});

    	return block;
    }

    // (74:4) {#if search.length > 0}
    function create_if_block_1$1(ctx) {
    	let button;
    	let t0;
    	let t1;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("Create: ");
    			t1 = text(/*search*/ ctx[1]);
    			attr_dev(button, "class", "button");
    			add_location(button, file$2, 74, 5, 1748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			dispose = listen_dev(button, "click", /*addTrack*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*search*/ 2) set_data_dev(t1, /*search*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(74:4) {#if search.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (81:3) {#each filteredTracks as track}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let current;

    	const tracksummary = new TrackSummary({
    			props: {
    				id: /*track*/ ctx[9].id,
    				active: /*selectedTrack*/ ctx[0] === /*track*/ ctx[9],
    				name: /*track*/ ctx[9].name,
    				description: /*track*/ ctx[9].description
    			},
    			$$inline: true
    		});

    	tracksummary.$on("click", function () {
    		if (is_function(/*selectTrack*/ ctx[5](/*track*/ ctx[9]))) /*selectTrack*/ ctx[5](/*track*/ ctx[9]).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tracksummary.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "panel-block");
    			add_location(div, file$2, 81, 4, 1890);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tracksummary, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tracksummary_changes = {};
    			if (dirty & /*filteredTracks*/ 4) tracksummary_changes.id = /*track*/ ctx[9].id;
    			if (dirty & /*selectedTrack, filteredTracks*/ 5) tracksummary_changes.active = /*selectedTrack*/ ctx[0] === /*track*/ ctx[9];
    			if (dirty & /*filteredTracks*/ 4) tracksummary_changes.name = /*track*/ ctx[9].name;
    			if (dirty & /*filteredTracks*/ 4) tracksummary_changes.description = /*track*/ ctx[9].description;
    			tracksummary.$set(tracksummary_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tracksummary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tracksummary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tracksummary);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(81:3) {#each filteredTracks as track}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedTrack*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "container is-fluid");
    			add_location(div, file$2, 49, 0, 1090);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $tracks;
    	validate_store(tracks, "tracks");
    	component_subscribe($$self, tracks, $$value => $$invalidate(6, $tracks = $$value));

    	onMount(() => {
    		let json = localStorage.getItem("tracksLastUpdate");
    		let updateVer = 1;

    		if (!json || json != updateVer) {
    			localStorage.setItem("tracksLastUpdate", updateVer);
    			localStorage.removeItem("tracks");
    		}

    		tracks.useLocalStorage();
    	});

    	let selectedTrack;
    	let search = "";

    	function addTrack() {
    		tracks.addNew(search);
    		$$invalidate(0, selectedTrack = $tracks[$tracks.length - 1]);
    		$$invalidate(1, search = "");
    	}

    	function removeTrack(event) {
    		$$invalidate(0, selectedTrack = null);
    		tracks.removeTrack(event.detail.id);
    	}

    	function selectTrack(track) {
    		$$invalidate(0, selectedTrack = track);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	const click_handler = () => $$invalidate(0, selectedTrack = null);

    	function input_input_handler() {
    		search = this.value;
    		$$invalidate(1, search);
    	}

    	$$self.$capture_state = () => ({
    		beforeUpdate,
    		onMount,
    		Track,
    		TrackSummary,
    		tracks,
    		selectedTrack,
    		search,
    		addTrack,
    		removeTrack,
    		selectTrack,
    		$tracks,
    		filteredTracks
    	});

    	$$self.$inject_state = $$props => {
    		if ("selectedTrack" in $$props) $$invalidate(0, selectedTrack = $$props.selectedTrack);
    		if ("search" in $$props) $$invalidate(1, search = $$props.search);
    		if ("filteredTracks" in $$props) $$invalidate(2, filteredTracks = $$props.filteredTracks);
    	};

    	let filteredTracks;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$tracks, search*/ 66) {
    			 $$invalidate(2, filteredTracks = $tracks.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase())));
    		}
    	};

    	return [
    		selectedTrack,
    		search,
    		filteredTracks,
    		addTrack,
    		removeTrack,
    		selectTrack,
    		$tracks,
    		click_handler,
    		input_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    var app = new App({
    	target: document.getElementById('app')
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
