
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
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

    const globals = (typeof window !== 'undefined' ? window : global);
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
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

    /* src/components/About.svelte generated by Svelte v3.19.2 */
    const file = "src/components/About.svelte";

    function create_fragment(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let h3;
    	let t2;
    	let a;
    	let t4;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Credits:";
    			t2 = text("\n          Created my free logo at ");
    			a = element("a");
    			a.textContent = "LogoMakr.com";
    			t4 = space();
    			button = element("button");
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file, 13, 2, 235);
    			attr_dev(h3, "class", "title");
    			add_location(h3, file, 16, 10, 356);
    			attr_dev(a, "href", "https://my.logomakr.com/");
    			add_location(a, file, 17, 34, 423);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file, 15, 6, 328);
    			attr_dev(div2, "class", "modal-content");
    			add_location(div2, file, 14, 4, 294);
    			attr_dev(button, "class", "modal-close is-large");
    			attr_dev(button, "aria-label", "close");
    			add_location(button, file, 20, 4, 503);
    			attr_dev(div3, "class", "modal");
    			toggle_class(div3, "is-active", /*active*/ ctx[0]);
    			add_location(div3, file, 12, 0, 188);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(div1, t2);
    			append_dev(div1, a);
    			append_dev(div3, t4);
    			append_dev(div3, button);

    			dispose = [
    				listen_dev(div0, "click", /*cancel*/ ctx[1], false, false, false),
    				listen_dev(button, "click", /*cancel*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*active*/ 1) {
    				toggle_class(div3, "is-active", /*active*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
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
    	let { active } = $$props;
    	const dispatch = createEventDispatcher();

    	function cancel() {
    		dispatch("cancel");
    	}

    	const writable_props = ["active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("About", $$slots, []);

    	$$self.$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		active,
    		dispatch,
    		cancel
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, cancel];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { active: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*active*/ ctx[0] === undefined && !("active" in props)) {
    			console.warn("<About> was created without expected prop 'active'");
    		}
    	}

    	get active() {
    		throw new Error("<About>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<About>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Navbar.svelte generated by Svelte v3.19.2 */
    const file$1 = "src/components/Navbar.svelte";

    function create_fragment$1(ctx) {
    	let nav;
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let button0;
    	let span0;
    	let t1;
    	let span1;
    	let t2;
    	let span2;
    	let t3;
    	let div5;
    	let div2;
    	let a;
    	let t5;
    	let div4;
    	let div3;
    	let button1;
    	let strong;
    	let t7;
    	let current;
    	let dispose;

    	const about = new About({
    			props: { active: /*showAbout*/ ctx[1] },
    			$$inline: true
    		});

    	about.$on("cancel", /*toggleAbout*/ ctx[3]);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			button0 = element("button");
    			span0 = element("span");
    			t1 = space();
    			span1 = element("span");
    			t2 = space();
    			span2 = element("span");
    			t3 = space();
    			div5 = element("div");
    			div2 = element("div");
    			a = element("a");
    			a.textContent = "About";
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");
    			button1 = element("button");
    			strong = element("strong");
    			strong.textContent = "Login";
    			t7 = space();
    			create_component(about.$$.fragment);
    			if (img.src !== (img_src_value = /*src*/ ctx[2])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Learning Tracks Logo");
    			attr_dev(img, "width", "300");
    			add_location(img, file$1, 26, 12, 556);
    			attr_dev(div0, "href", "http://learning-tracks.netlify.com");
    			attr_dev(div0, "id", "logo");
    			add_location(div0, file$1, 25, 8, 486);
    			attr_dev(span0, "aria-hidden", "true");
    			add_location(span0, file$1, 34, 12, 854);
    			attr_dev(span1, "aria-hidden", "true");
    			add_location(span1, file$1, 35, 12, 899);
    			attr_dev(span2, "aria-hidden", "true");
    			add_location(span2, file$1, 36, 12, 944);
    			attr_dev(button0, "class", "navbar-burger burger");
    			attr_dev(button0, "data-target", "navMenu");
    			attr_dev(button0, "aria-label", "menu");
    			attr_dev(button0, "aria-expanded", "false");
    			toggle_class(button0, "is-active", /*showMenu*/ ctx[0]);
    			add_location(button0, file$1, 28, 8, 630);
    			attr_dev(div1, "class", "navbar-brand");
    			add_location(div1, file$1, 24, 4, 447);
    			attr_dev(a, "href", "#");
    			attr_dev(a, "class", "navbar-item");
    			add_location(a, file$1, 44, 12, 1130);
    			attr_dev(div2, "class", "navbar-start");
    			add_location(div2, file$1, 43, 8, 1091);
    			add_location(strong, file$1, 51, 20, 1380);
    			attr_dev(button1, "class", "button is-light");
    			add_location(button1, file$1, 50, 16, 1327);
    			attr_dev(div3, "class", "navbar-item");
    			add_location(div3, file$1, 49, 12, 1285);
    			attr_dev(div4, "class", "navbar-end");
    			add_location(div4, file$1, 48, 8, 1248);
    			attr_dev(div5, "class", "navbar-menu");
    			attr_dev(div5, "id", "navMenu");
    			toggle_class(div5, "is-active", /*showMenu*/ ctx[0]);
    			add_location(div5, file$1, 42, 4, 1017);
    			attr_dev(nav, "class", "navbar is-fixed-top");
    			attr_dev(nav, "role", "navigation");
    			attr_dev(nav, "aria-label", "main navigation");
    			add_location(nav, file$1, 23, 0, 362);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div1, t0);
    			append_dev(div1, button0);
    			append_dev(button0, span0);
    			append_dev(button0, t1);
    			append_dev(button0, span1);
    			append_dev(button0, t2);
    			append_dev(button0, span2);
    			append_dev(nav, t3);
    			append_dev(nav, div5);
    			append_dev(div5, div2);
    			append_dev(div2, a);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, button1);
    			append_dev(button1, strong);
    			insert_dev(target, t7, anchor);
    			mount_component(about, target, anchor);
    			current = true;

    			dispose = [
    				listen_dev(button0, "click", /*toggleMenu*/ ctx[4], false, false, false),
    				listen_dev(a, "click", /*toggleAbout*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*showMenu*/ 1) {
    				toggle_class(button0, "is-active", /*showMenu*/ ctx[0]);
    			}

    			if (dirty & /*showMenu*/ 1) {
    				toggle_class(div5, "is-active", /*showMenu*/ ctx[0]);
    			}

    			const about_changes = {};
    			if (dirty & /*showAbout*/ 2) about_changes.active = /*showAbout*/ ctx[1];
    			about.$set(about_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			if (detaching) detach_dev(t7);
    			destroy_component(about, detaching);
    			run_all(dispose);
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
    	let src = "/images/LTLogo.png";
    	let showMenu;

    	//TODO: decide if the about component should live with the
    	// navbar or the app component
    	let showAbout;

    	function toggleAbout() {
    		$$invalidate(1, showAbout = !showAbout);
    	}

    	function toggleMenu() {
    		$$invalidate(0, showMenu = !showMenu);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Navbar", $$slots, []);

    	$$self.$capture_state = () => ({
    		About,
    		src,
    		showMenu,
    		showAbout,
    		toggleAbout,
    		toggleMenu
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(2, src = $$props.src);
    		if ("showMenu" in $$props) $$invalidate(0, showMenu = $$props.showMenu);
    		if ("showAbout" in $$props) $$invalidate(1, showAbout = $$props.showAbout);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [showMenu, showAbout, src, toggleAbout, toggleMenu];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$1.name
    		});
    	}
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
      const { subscribe, set, update } = writable([
        {
          id: 0,
          name: 'Svelte',
          description: 'Learning svelte',
          links: [
            {
              id: 0,
              title: 'Official tutorial',
              url: 'https://svelte.dev/tutorial/basics',
            },
            {
              id: 1,
              title: 'Scotch IO',
              url: 'https://svelte.dev/tutorial/basics',
            },
          ],
        },
        {
          id: 1,
          name: 'Node',
          description: 'learning node',
          links: [
            {
              id: 0,
              title: 'W3 Schools',
              url: 'https://www.w3schools.com/nodejs/',
            },
          ],
        },
      ]);

      return {
        subscribe,
        set,
        useLocalStorage: () => {
          const json = localStorage.getItem('tracks');

          if (json) {
            set(JSON.parse(json));
          }

          subscribe((current) => {
            localStorage.setItem('tracks', JSON.stringify(current));
          });
        },
        addNew: (name) =>
          update((n) => [
            ...n,
            {
              id: n.length,
              name: name,
              description: 'learn something new!',
              links: [],
            },
          ]),
        removeTrack: (id) => update((n) => n.filter((t) => t.id !== id)),
        updateTrack: (track) =>
          update((n) => n.map((t) => (t.id === track.id ? track : t))),
      };
    }

    const tracks = createTracks();

    function selectTextOnFocus(node) {
      const handleFocus = () => {
        node && typeof node.select === 'function' && node.select();
      };

      node.addEventListener('focus', handleFocus);

      return {
        destroy() {
          node.removeEventListener('focus', handleFocus);
        },
      };
    }

    /* src/components/Confirmation.svelte generated by Svelte v3.19.2 */
    const file$2 = "src/components/Confirmation.svelte";

    function create_fragment$2(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let header;
    	let div1;
    	let t2;
    	let button0;
    	let t3;
    	let section;
    	let t4;
    	let t5;
    	let footer;
    	let button1;
    	let t7;
    	let button2;
    	let dispose;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			header = element("header");
    			div1 = element("div");
    			div1.textContent = "Confirm delete";
    			t2 = space();
    			button0 = element("button");
    			t3 = space();
    			section = element("section");
    			t4 = text(/*message*/ ctx[1]);
    			t5 = space();
    			footer = element("footer");
    			button1 = element("button");
    			button1.textContent = "Confirm";
    			t7 = space();
    			button2 = element("button");
    			button2.textContent = "Cancel";
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file$2, 20, 1, 348);
    			attr_dev(div1, "class", "modal-card-title");
    			add_location(div1, file$2, 23, 3, 470);
    			attr_dev(button0, "class", "delete");
    			attr_dev(button0, "aria-label", "close");
    			add_location(button0, file$2, 24, 3, 524);
    			attr_dev(header, "class", "modal-card-head");
    			add_location(header, file$2, 22, 2, 433);
    			attr_dev(section, "class", "modal-card-body");
    			add_location(section, file$2, 26, 2, 610);
    			attr_dev(button1, "class", "button is-danger");
    			add_location(button1, file$2, 30, 3, 708);
    			attr_dev(button2, "class", "button");
    			add_location(button2, file$2, 31, 3, 782);
    			attr_dev(footer, "class", "modal-card-foot");
    			add_location(footer, file$2, 29, 2, 672);
    			attr_dev(div2, "class", "modal-card");
    			add_location(div2, file$2, 21, 1, 406);
    			attr_dev(div3, "class", "modal");
    			toggle_class(div3, "is-active", /*active*/ ctx[0]);
    			add_location(div3, file$2, 19, 0, 302);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, header);
    			append_dev(header, div1);
    			append_dev(header, t2);
    			append_dev(header, button0);
    			append_dev(div2, t3);
    			append_dev(div2, section);
    			append_dev(section, t4);
    			append_dev(div2, t5);
    			append_dev(div2, footer);
    			append_dev(footer, button1);
    			append_dev(footer, t7);
    			append_dev(footer, button2);

    			dispose = [
    				listen_dev(div0, "click", /*cancel*/ ctx[2], false, false, false),
    				listen_dev(button0, "click", /*cancel*/ ctx[2], false, false, false),
    				listen_dev(button1, "click", /*confirm*/ ctx[3], false, false, false),
    				listen_dev(button2, "click", /*cancel*/ ctx[2], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*message*/ 2) set_data_dev(t4, /*message*/ ctx[1]);

    			if (dirty & /*active*/ 1) {
    				toggle_class(div3, "is-active", /*active*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			run_all(dispose);
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
    	let { active } = $$props;
    	let { message = "Are you sure you want to delete?" } = $$props;
    	const dispatch = createEventDispatcher();

    	function cancel() {
    		dispatch("cancel");
    	}

    	function confirm() {
    		dispatch("confirm");
    	}

    	const writable_props = ["active", "message"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Confirmation> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Confirmation", $$slots, []);

    	$$self.$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("message" in $$props) $$invalidate(1, message = $$props.message);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		active,
    		message,
    		dispatch,
    		cancel,
    		confirm
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("message" in $$props) $$invalidate(1, message = $$props.message);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, message, cancel, confirm];
    }

    class Confirmation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { active: 0, message: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Confirmation",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*active*/ ctx[0] === undefined && !("active" in props)) {
    			console.warn("<Confirmation> was created without expected prop 'active'");
    		}
    	}

    	get active() {
    		throw new Error("<Confirmation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Confirmation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get message() {
    		throw new Error("<Confirmation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set message(value) {
    		throw new Error("<Confirmation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TrackLink.svelte generated by Svelte v3.19.2 */
    const file$3 = "src/components/TrackLink.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let a;
    	let t0_value = /*link*/ ctx[0].title + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let i;
    	let t2;
    	let current;
    	let dispose;

    	const confirmation = new Confirmation({
    			props: {
    				active: /*showConfirmation*/ ctx[1],
    				message: `Are you sure you want to delete the '${/*link*/ ctx[0].title}' link?`
    			},
    			$$inline: true
    		});

    	confirmation.$on("cancel", /*toggleConfirmation*/ ctx[3]);
    	confirmation.$on("confirm", /*removeLink*/ ctx[2]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			i = element("i");
    			t2 = space();
    			create_component(confirmation.$$.fragment);
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[0].url);
    			add_location(a, file$3, 21, 4, 376);
    			attr_dev(i, "class", "delete is-small");
    			add_location(i, file$3, 22, 4, 416);
    			add_location(div, file$3, 20, 0, 366);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, t0);
    			append_dev(div, t1);
    			append_dev(div, i);
    			insert_dev(target, t2, anchor);
    			mount_component(confirmation, target, anchor);
    			current = true;
    			dispose = listen_dev(i, "click", /*toggleConfirmation*/ ctx[3], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*link*/ 1) && t0_value !== (t0_value = /*link*/ ctx[0].title + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*link*/ 1 && a_href_value !== (a_href_value = /*link*/ ctx[0].url)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			const confirmation_changes = {};
    			if (dirty & /*showConfirmation*/ 2) confirmation_changes.active = /*showConfirmation*/ ctx[1];
    			if (dirty & /*link*/ 1) confirmation_changes.message = `Are you sure you want to delete the '${/*link*/ ctx[0].title}' link?`;
    			confirmation.$set(confirmation_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confirmation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confirmation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching) detach_dev(t2);
    			destroy_component(confirmation, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { link } = $$props;
    	let showConfirmation;
    	const dispatch = createEventDispatcher();

    	function removeLink() {
    		dispatch("remove", { id: link.id });
    	}

    	function toggleConfirmation() {
    		$$invalidate(1, showConfirmation = !showConfirmation);
    	}

    	const writable_props = ["link"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TrackLink> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TrackLink", $$slots, []);

    	$$self.$set = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Confirmation,
    		link,
    		showConfirmation,
    		dispatch,
    		removeLink,
    		toggleConfirmation
    	});

    	$$self.$inject_state = $$props => {
    		if ("link" in $$props) $$invalidate(0, link = $$props.link);
    		if ("showConfirmation" in $$props) $$invalidate(1, showConfirmation = $$props.showConfirmation);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [link, showConfirmation, removeLink, toggleConfirmation];
    }

    class TrackLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { link: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TrackLink",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*link*/ ctx[0] === undefined && !("link" in props)) {
    			console.warn("<TrackLink> was created without expected prop 'link'");
    		}
    	}

    	get link() {
    		throw new Error("<TrackLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set link(value) {
    		throw new Error("<TrackLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ToolTip.svelte generated by Svelte v3.19.2 */

    const file$4 = "src/components/ToolTip.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let t0;
    	let span;
    	let t1;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[3].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			t0 = space();
    			span = element("span");
    			t1 = text(/*text*/ ctx[0]);
    			attr_dev(span, "class", "tooltiptext svelte-a4o437");
    			add_location(span, file$4, 50, 2, 779);
    			attr_dev(div, "class", "svelte-a4o437");
    			toggle_class(div, "tooltip", /*active*/ ctx[1]);
    			add_location(div, file$4, 48, 0, 732);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			append_dev(div, t0);
    			append_dev(div, span);
    			append_dev(span, t1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4) {
    				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
    			}

    			if (!current || dirty & /*text*/ 1) set_data_dev(t1, /*text*/ ctx[0]);

    			if (dirty & /*active*/ 2) {
    				toggle_class(div, "tooltip", /*active*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { text } = $$props;
    	let { active = false } = $$props;
    	const writable_props = ["text", "active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ToolTip> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ToolTip", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ text, active });

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, active, $$scope, $$slots];
    }

    class ToolTip extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { text: 0, active: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToolTip",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*text*/ ctx[0] === undefined && !("text" in props)) {
    			console.warn("<ToolTip> was created without expected prop 'text'");
    		}
    	}

    	get text() {
    		throw new Error("<ToolTip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<ToolTip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<ToolTip>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<ToolTip>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const withHttps = url => !/^https?:\/\//i.test(url) ? `https://${url}` : url;

    /* src/components/AddLink.svelte generated by Svelte v3.19.2 */

    const { Error: Error_1, console: console_1 } = globals;
    const file$5 = "src/components/AddLink.svelte";

    // (77:6) <ToolTip text={error} active={hasError}>
    function create_default_slot(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", "input");
    			attr_dev(input, "placeholder", "url");
    			toggle_class(input, "is-danger", /*hasError*/ ctx[5]);
    			add_location(input, file$5, 77, 8, 1686);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*linkUrl*/ ctx[3]);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[14]),
    				listen_dev(input, "blur", /*onUrlBlur*/ ctx[9], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*linkUrl*/ 8 && input.value !== /*linkUrl*/ ctx[3]) {
    				set_input_value(input, /*linkUrl*/ ctx[3]);
    			}

    			if (dirty & /*hasError*/ 32) {
    				toggle_class(input, "is-danger", /*hasError*/ ctx[5]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(77:6) <ToolTip text={error} active={hasError}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let div2;
    	let div1;
    	let h3;
    	let t2;
    	let t3;
    	let input;
    	let t4;
    	let button;
    	let t5;
    	let t6;
    	let div3;
    	let current;
    	let dispose;

    	const tooltip = new ToolTip({
    			props: {
    				text: /*error*/ ctx[1],
    				active: /*hasError*/ ctx[5],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Add new link";
    			t2 = space();
    			create_component(tooltip.$$.fragment);
    			t3 = space();
    			input = element("input");
    			t4 = space();
    			button = element("button");
    			t5 = text("Save");
    			t6 = space();
    			div3 = element("div");
    			attr_dev(div0, "class", "modal-background");
    			add_location(div0, file$5, 72, 1, 1485);
    			attr_dev(h3, "class", "title");
    			add_location(h3, file$5, 75, 6, 1595);
    			attr_dev(input, "class", "input");
    			attr_dev(input, "placeholder", /*linkTitlePlaceholder*/ ctx[4]);
    			add_location(input, file$5, 80, 6, 1826);
    			attr_dev(button, "class", "button is-primary");
    			button.disabled = /*disabled*/ ctx[6];
    			add_location(button, file$5, 81, 3, 1913);
    			attr_dev(div1, "class", "box");
    			add_location(div1, file$5, 74, 2, 1571);
    			attr_dev(div2, "class", "modal-content");
    			add_location(div2, file$5, 73, 1, 1541);
    			attr_dev(div3, "class", "modal-close is-large");
    			attr_dev(div3, "aria-label", "close");
    			add_location(div3, file$5, 86, 1, 2015);
    			attr_dev(div4, "class", "modal");
    			toggle_class(div4, "is-active", /*active*/ ctx[0]);
    			add_location(div4, file$5, 71, 0, 1439);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t0);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(div1, t2);
    			mount_component(tooltip, div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, input);
    			set_input_value(input, /*linkTitle*/ ctx[2]);
    			append_dev(div1, t4);
    			append_dev(div1, button);
    			append_dev(button, t5);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			current = true;

    			dispose = [
    				listen_dev(div0, "click", /*cancel*/ ctx[7], false, false, false),
    				listen_dev(input, "input", /*input_input_handler_1*/ ctx[15]),
    				listen_dev(button, "click", /*save*/ ctx[8], false, false, false),
    				listen_dev(div3, "click", /*cancel*/ ctx[7], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const tooltip_changes = {};
    			if (dirty & /*error*/ 2) tooltip_changes.text = /*error*/ ctx[1];
    			if (dirty & /*hasError*/ 32) tooltip_changes.active = /*hasError*/ ctx[5];

    			if (dirty & /*$$scope, linkUrl, hasError*/ 65576) {
    				tooltip_changes.$$scope = { dirty, ctx };
    			}

    			tooltip.$set(tooltip_changes);

    			if (!current || dirty & /*linkTitlePlaceholder*/ 16) {
    				attr_dev(input, "placeholder", /*linkTitlePlaceholder*/ ctx[4]);
    			}

    			if (dirty & /*linkTitle*/ 4 && input.value !== /*linkTitle*/ ctx[2]) {
    				set_input_value(input, /*linkTitle*/ ctx[2]);
    			}

    			if (!current || dirty & /*disabled*/ 64) {
    				prop_dev(button, "disabled", /*disabled*/ ctx[6]);
    			}

    			if (dirty & /*active*/ 1) {
    				toggle_class(div4, "is-active", /*active*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tooltip.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tooltip.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(tooltip);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { active } = $$props;
    	let error;
    	let linkTitle = "";
    	let linkUrl = "";
    	let linkTitlePlaceholder = "title";
    	const dispatch = createEventDispatcher();

    	function cancel() {
    		reset();
    		dispatch("cancel");
    	}

    	function save() {
    		console.log(withHttps(linkUrl));
    		dispatch("save", { linkUrl: withHttps(linkUrl), linkTitle });
    		reset();
    	}

    	function reset() {
    		$$invalidate(2, linkTitle = "");
    		$$invalidate(3, linkUrl = "");
    		$$invalidate(1, error = "");
    	}

    	function onUrlBlur() {
    		if (linkUrl && linkUrl.length > 0) {
    			$$invalidate(4, linkTitlePlaceholder = "loading....");
    			getURLTitle();
    		}
    	}

    	async function getURLTitle() {
    		const encodedUrl = encodeURI(linkUrl);

    		const result = await fetch(`/.netlify/functions/page-title?url=${encodedUrl}`).then(response => {
    			if (response.ok) {
    				return response.json();
    			} else {
    				throw new Error("Invalid url supplied");
    			}
    		}).catch(e => onError(e));

    		if (result) {
    			$$invalidate(1, error = null);
    			$$invalidate(2, linkTitle = result.title);
    			$$invalidate(4, linkTitlePlaceholder = "title");
    		}
    	}

    	function onError(e) {
    		$$invalidate(1, error = e.message);
    	}

    	const writable_props = ["active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<AddLink> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AddLink", $$slots, []);

    	function input_input_handler() {
    		linkUrl = this.value;
    		$$invalidate(3, linkUrl);
    	}

    	function input_input_handler_1() {
    		linkTitle = this.value;
    		$$invalidate(2, linkTitle);
    	}

    	$$self.$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		ToolTip,
    		withHttps,
    		active,
    		error,
    		linkTitle,
    		linkUrl,
    		linkTitlePlaceholder,
    		dispatch,
    		cancel,
    		save,
    		reset,
    		onUrlBlur,
    		getURLTitle,
    		onError,
    		hasError,
    		disabled
    	});

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    		if ("error" in $$props) $$invalidate(1, error = $$props.error);
    		if ("linkTitle" in $$props) $$invalidate(2, linkTitle = $$props.linkTitle);
    		if ("linkUrl" in $$props) $$invalidate(3, linkUrl = $$props.linkUrl);
    		if ("linkTitlePlaceholder" in $$props) $$invalidate(4, linkTitlePlaceholder = $$props.linkTitlePlaceholder);
    		if ("hasError" in $$props) $$invalidate(5, hasError = $$props.hasError);
    		if ("disabled" in $$props) $$invalidate(6, disabled = $$props.disabled);
    	};

    	let hasError;
    	let disabled;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*error*/ 2) {
    			 $$invalidate(5, hasError = error && error.length > 0);
    		}

    		if ($$self.$$.dirty & /*hasError, linkTitle, linkUrl*/ 44) {
    			 $$invalidate(6, disabled = hasError || linkTitle.length === 0 || linkUrl.length === 0);
    		}
    	};

    	return [
    		active,
    		error,
    		linkTitle,
    		linkUrl,
    		linkTitlePlaceholder,
    		hasError,
    		disabled,
    		cancel,
    		save,
    		onUrlBlur,
    		dispatch,
    		reset,
    		getURLTitle,
    		onError,
    		input_input_handler,
    		input_input_handler_1
    	];
    }

    class AddLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { active: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AddLink",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*active*/ ctx[0] === undefined && !("active" in props)) {
    			console_1.warn("<AddLink> was created without expected prop 'active'");
    		}
    	}

    	get active() {
    		throw new Error_1("<AddLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error_1("<AddLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Track.svelte generated by Svelte v3.19.2 */
    const file$6 = "src/components/Track.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (89:2) {:else}
    function create_else_block(ctx) {
    	let div2;
    	let div0;
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
    	let i0;
    	let t6;
    	let div1;
    	let button;
    	let i1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			span1 = element("span");
    			t2 = text("(");
    			t3 = text(t3_value);
    			t4 = text(")");
    			t5 = space();
    			i0 = element("i");
    			t6 = space();
    			div1 = element("div");
    			button = element("button");
    			i1 = element("i");
    			add_location(span0, file$6, 91, 5, 2275);
    			add_location(span1, file$6, 92, 5, 2306);
    			attr_dev(i0, "class", "delete is-small");
    			add_location(i0, file$6, 93, 5, 2347);
    			attr_dev(div0, "class", "level-left");
    			add_location(div0, file$6, 90, 4, 2245);
    			attr_dev(i1, "class", "iconify");
    			attr_dev(i1, "data-icon", "fa-solid:plus");
    			attr_dev(i1, "data-inline", "false");
    			add_location(i1, file$6, 97, 6, 2523);
    			attr_dev(button, "class", "button is-small");
    			add_location(button, file$6, 96, 5, 2455);
    			attr_dev(div1, "class", "level-right");
    			add_location(div1, file$6, 95, 4, 2424);
    			attr_dev(div2, "class", "level");
    			add_location(div2, file$6, 89, 3, 2196);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, span1);
    			append_dev(span1, t2);
    			append_dev(span1, t3);
    			append_dev(span1, t4);
    			append_dev(div0, t5);
    			append_dev(div0, i0);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(button, i1);

    			dispose = [
    				listen_dev(i0, "click", /*toggleConfirmation*/ ctx[11], false, false, false),
    				listen_dev(button, "click", /*toggleShowAddLink*/ ctx[12], false, false, false),
    				listen_dev(div2, "dblclick", /*editTrack*/ ctx[6], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*track*/ 1 && t0_value !== (t0_value = /*track*/ ctx[0].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*track*/ 1 && t3_value !== (t3_value = /*track*/ ctx[0].description + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(89:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (73:2) {#if edit}
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
    			add_location(input0, file$6, 74, 4, 1766);
    			attr_dev(input1, "class", "input");
    			add_location(input1, file$6, 78, 4, 1900);
    			attr_dev(i, "class", "iconify");
    			attr_dev(i, "data-icon", "fa-solid:check");
    			attr_dev(i, "data-inline", "false");
    			add_location(i, file$6, 83, 5, 2071);
    			attr_dev(button, "class", "button");
    			add_location(button, file$6, 82, 4, 2019);
    			add_location(div, file$6, 73, 3, 1756);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			/*input0_binding*/ ctx[15](input0);
    			set_input_value(input0, /*track*/ ctx[0].name);
    			append_dev(div, t0);
    			append_dev(div, input1);
    			set_input_value(input1, /*track*/ ctx[0].description);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, i);

    			dispose = [
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[16]),
    				listen_dev(input0, "keydown", /*onEnter*/ ctx[10], false, false, false),
    				action_destroyer(selectTextOnFocus_action = selectTextOnFocus.call(null, input0)),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[17]),
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
    			/*input0_binding*/ ctx[15](null);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(73:2) {#if edit}",
    		ctx
    	});

    	return block;
    }

    // (106:1) {#if track.links}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*track*/ ctx[0].links;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

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
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*track, removeLink*/ 513) {
    				each_value = /*track*/ ctx[0].links;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
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
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(106:1) {#if track.links}",
    		ctx
    	});

    	return block;
    }

    // (107:2) {#each track.links as link}
    function create_each_block(ctx) {
    	let div;
    	let t;
    	let current;

    	const tracklink = new TrackLink({
    			props: { link: /*link*/ ctx[18] },
    			$$inline: true
    		});

    	tracklink.$on("remove", /*removeLink*/ ctx[9]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tracklink.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "panel-block");
    			add_location(div, file$6, 107, 3, 2713);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(tracklink, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tracklink_changes = {};
    			if (dirty & /*track*/ 1) tracklink_changes.link = /*link*/ ctx[18];
    			tracklink.$set(tracklink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tracklink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tracklink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(tracklink);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(107:2) {#each track.links as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*edit*/ ctx[1]) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*track*/ ctx[0].links && create_if_block(ctx);

    	const addlink = new AddLink({
    			props: { active: /*showAddLink*/ ctx[4] },
    			$$inline: true
    		});

    	addlink.$on("cancel", /*toggleShowAddLink*/ ctx[12]);
    	addlink.$on("save", /*addLink*/ ctx[8]);

    	const confirmation = new Confirmation({
    			props: {
    				active: /*showConfirmation*/ ctx[3],
    				message: `Are you sure you want to delete the '${/*track*/ ctx[0].name}' track?`
    			},
    			$$inline: true
    		});

    	confirmation.$on("cancel", /*toggleConfirmation*/ ctx[11]);
    	confirmation.$on("confirm", /*removeTrack*/ ctx[5]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			create_component(addlink.$$.fragment);
    			t2 = space();
    			create_component(confirmation.$$.fragment);
    			attr_dev(div0, "class", "panel-heading");
    			add_location(div0, file$6, 71, 1, 1712);
    			attr_dev(div1, "class", "panel");
    			add_location(div1, file$6, 70, 0, 1682);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_block0.m(div0, null);
    			append_dev(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			insert_dev(target, t1, anchor);
    			mount_component(addlink, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(confirmation, target, anchor);
    			current = true;
    			dispose = listen_dev(div1, "click", /*click_handler*/ ctx[14], false, false, false);
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

    			if (/*track*/ ctx[0].links) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const addlink_changes = {};
    			if (dirty & /*showAddLink*/ 16) addlink_changes.active = /*showAddLink*/ ctx[4];
    			addlink.$set(addlink_changes);
    			const confirmation_changes = {};
    			if (dirty & /*showConfirmation*/ 8) confirmation_changes.active = /*showConfirmation*/ ctx[3];
    			if (dirty & /*track*/ 1) confirmation_changes.message = `Are you sure you want to delete the '${/*track*/ ctx[0].name}' track?`;
    			confirmation.$set(confirmation_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(addlink.$$.fragment, local);
    			transition_in(confirmation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			transition_out(addlink.$$.fragment, local);
    			transition_out(confirmation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t1);
    			destroy_component(addlink, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(confirmation, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { track } = $$props;
    	let edit;
    	let nameInput;
    	let showConfirmation;
    	let showAddLink;
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

    	function addLink(event) {
    		// TODO: is this causing two renders?
    		// look into possibility of using storefunction to update store
    		// as opposed to updating item then updating store.
    		$$invalidate(
    			0,
    			track.links = [
    				...track.links,
    				{
    					id: track.links.length + 1,
    					title: event.detail.linkTitle,
    					url: event.detail.linkUrl
    				}
    			],
    			track
    		);

    		tracks.updateTrack(track);
    		toggleShowAddLink();
    	}

    	function removeLink(event) {
    		// TODO: is this causing two renders?
    		// look into possibility of using storefunction to update store
    		// as opposed to updating item then updating store.
    		$$invalidate(0, track.links = track.links.filter(t => t.id !== event.detail.id), track);

    		tracks.updateTrack(track);
    	}

    	function onEnter(event) {
    		if (event.key === "Enter") {
    			updateTrack();
    		}
    	}

    	function toggleConfirmation() {
    		$$invalidate(3, showConfirmation = !showConfirmation);
    	}

    	function toggleShowAddLink() {
    		$$invalidate(4, showAddLink = !showAddLink);
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

    	function input1_input_handler() {
    		track.description = this.value;
    		$$invalidate(0, track);
    	}

    	$$self.$set = $$props => {
    		if ("track" in $$props) $$invalidate(0, track = $$props.track);
    	};

    	$$self.$capture_state = () => ({
    		tick,
    		createEventDispatcher,
    		tracks,
    		selectTextOnFocus,
    		TrackLink,
    		Confirmation,
    		AddLink,
    		track,
    		edit,
    		nameInput,
    		showConfirmation,
    		showAddLink,
    		dispatch,
    		removeTrack,
    		editTrack,
    		updateTrack,
    		addLink,
    		removeLink,
    		onEnter,
    		toggleConfirmation,
    		toggleShowAddLink
    	});

    	$$self.$inject_state = $$props => {
    		if ("track" in $$props) $$invalidate(0, track = $$props.track);
    		if ("edit" in $$props) $$invalidate(1, edit = $$props.edit);
    		if ("nameInput" in $$props) $$invalidate(2, nameInput = $$props.nameInput);
    		if ("showConfirmation" in $$props) $$invalidate(3, showConfirmation = $$props.showConfirmation);
    		if ("showAddLink" in $$props) $$invalidate(4, showAddLink = $$props.showAddLink);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		track,
    		edit,
    		nameInput,
    		showConfirmation,
    		showAddLink,
    		removeTrack,
    		editTrack,
    		updateTrack,
    		addLink,
    		removeLink,
    		onEnter,
    		toggleConfirmation,
    		toggleShowAddLink,
    		dispatch,
    		click_handler,
    		input0_binding,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class Track extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { track: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Track",
    			options,
    			id: create_fragment$6.name
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

    const file$7 = "src/components/TrackSummary.svelte";

    function create_fragment$7(ctx) {
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
    			add_location(span, file$7, 28, 8, 397);
    			add_location(div0, file$7, 27, 4, 383);
    			attr_dev(div1, "class", "desription svelte-1bl8hev");
    			add_location(div1, file$7, 30, 4, 432);
    			attr_dev(div2, "class", "summary svelte-1bl8hev");
    			toggle_class(div2, "active", /*active*/ ctx[2]);
    			add_location(div2, file$7, 26, 0, 334);
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
    			dispose = listen_dev(div2, "click", /*click_handler*/ ctx[3], false, false, false);
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let { description } = $$props;
    	let { active } = $$props;
    	const writable_props = ["name", "description", "active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TrackSummary> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("TrackSummary", $$slots, []);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({ name, description, active });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("active" in $$props) $$invalidate(2, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, description, active, click_handler];
    }

    class TrackSummary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { name: 0, description: 1, active: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TrackSummary",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

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
    const file$8 = "src/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (50:1) {#if selectedTrack}
    function create_if_block_3(ctx) {
    	let nav;
    	let ul;
    	let li0;
    	let a0;
    	let t1;
    	let li1;
    	let a1;
    	let t2_value = /*selectedTrack*/ ctx[0].name + "";
    	let t2;
    	let dispose;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "Tracks";
    			t1 = space();
    			li1 = element("li");
    			a1 = element("a");
    			t2 = text(t2_value);
    			attr_dev(a0, "href", "#");
    			add_location(a0, file$8, 52, 8, 1266);
    			add_location(li0, file$8, 52, 4, 1262);
    			attr_dev(a1, "href", "#");
    			add_location(a1, file$8, 53, 26, 1361);
    			attr_dev(li1, "class", "is-active");
    			add_location(li1, file$8, 53, 4, 1339);
    			add_location(ul, file$8, 51, 3, 1253);
    			attr_dev(nav, "class", "breadcrumb");
    			attr_dev(nav, "aria-label", "breadcrumbs");
    			add_location(nav, file$8, 50, 2, 1200);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t1);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(a1, t2);
    			dispose = listen_dev(a0, "click", /*click_handler*/ ctx[7], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedTrack*/ 1 && t2_value !== (t2_value = /*selectedTrack*/ ctx[0].name + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(50:1) {#if selectedTrack}",
    		ctx
    	});

    	return block;
    }

    // (67:2) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let div0;
    	let p;
    	let input;
    	let t0;
    	let t1;
    	let t2;
    	let current;
    	let dispose;

    	function select_block_type_1(ctx, dirty) {
    		if (/*search*/ ctx[1].length === 0) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*search*/ ctx[1].length > 0 && create_if_block_1$1(ctx);
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
    			if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(input, "class", "input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "filter or create new");
    			add_location(input, file$8, 70, 6, 1720);
    			attr_dev(p, "class", "control has-icons-left");
    			add_location(p, file$8, 69, 5, 1679);
    			attr_dev(div0, "class", "panel-heading");
    			add_location(div0, file$8, 68, 4, 1646);
    			attr_dev(div1, "class", "panel");
    			add_location(div1, file$8, 67, 3, 1622);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, input);
    			set_input_value(input, /*search*/ ctx[1]);
    			append_dev(p, t0);
    			if_block0.m(p, null);
    			append_dev(div0, t1);
    			if (if_block1) if_block1.m(div0, null);
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

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(p, null);
    				}
    			}

    			if (/*search*/ ctx[1].length > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(div0, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*selectedTrack, filteredTracks, selectTrack*/ 37) {
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
    			if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks, detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(67:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (63:2) {#if selectedTrack}
    function create_if_block$1(ctx) {
    	let div;
    	let current;

    	const track = new Track({
    			props: { track: /*selectedTrack*/ ctx[0] },
    			$$inline: true
    		});

    	track.$on("removeTrack", /*removeTrack*/ ctx[4]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(track.$$.fragment);
    			add_location(div, file$8, 63, 3, 1523);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(track, div, null);
    			current = true;
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
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(63:2) {#if selectedTrack}",
    		ctx
    	});

    	return block;
    }

    // (82:6) {:else}
    function create_else_block_1(ctx) {
    	let span;
    	let i;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			attr_dev(i, "class", "delete");
    			add_location(i, file$8, 83, 8, 2132);
    			attr_dev(span, "class", "icon is-left");
    			add_location(span, file$8, 82, 7, 2065);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    			dispose = listen_dev(span, "click", /*click_handler_1*/ ctx[9], false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(82:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (75:6) {#if search.length === 0}
    function create_if_block_2(ctx) {
    	let span;
    	let i;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			attr_dev(i, "class", "iconify");
    			attr_dev(i, "data-icon", "fa-solid:search");
    			attr_dev(i, "data-inline", "false");
    			attr_dev(i, "aria-hidden", "true");
    			add_location(i, file$8, 76, 8, 1908);
    			attr_dev(span, "class", "icon is-left");
    			add_location(span, file$8, 75, 7, 1872);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(75:6) {#if search.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (88:5) {#if search.length > 0}
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
    			add_location(button, file$8, 88, 6, 2227);
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
    		source: "(88:5) {#if search.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (95:4) {#each filteredTracks as track}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let current;

    	const tracksummary = new TrackSummary({
    			props: {
    				active: /*selectedTrack*/ ctx[0] === /*track*/ ctx[10],
    				name: /*track*/ ctx[10].name,
    				description: /*track*/ ctx[10].description
    			},
    			$$inline: true
    		});

    	tracksummary.$on("click", function () {
    		if (is_function(/*selectTrack*/ ctx[5](/*track*/ ctx[10]))) /*selectTrack*/ ctx[5](/*track*/ ctx[10]).apply(this, arguments);
    	});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(tracksummary.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "panel-block");
    			add_location(div, file$8, 95, 5, 2376);
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
    			if (dirty & /*selectedTrack, filteredTracks*/ 5) tracksummary_changes.active = /*selectedTrack*/ ctx[0] === /*track*/ ctx[10];
    			if (dirty & /*filteredTracks*/ 4) tracksummary_changes.name = /*track*/ ctx[10].name;
    			if (dirty & /*filteredTracks*/ 4) tracksummary_changes.description = /*track*/ ctx[10].description;
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
    		source: "(95:4) {#each filteredTracks as track}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let current_block_type_index;
    	let if_block1;
    	let current;
    	const navbar = new Navbar({ $$inline: true });
    	let if_block0 = /*selectedTrack*/ ctx[0] && create_if_block_3(ctx);
    	const if_block_creators = [create_if_block$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*selectedTrack*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if_block1.c();
    			attr_dev(section, "class", "section");
    			add_location(section, file$8, 47, 0, 1132);
    			attr_dev(div0, "class", "container is-fluid");
    			add_location(div0, file$8, 61, 1, 1465);
    			attr_dev(div1, "class", "section");
    			add_location(div1, file$8, 60, 0, 1442);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			mount_component(navbar, section, null);
    			append_dev(section, t0);
    			if (if_block0) if_block0.m(section, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			if_blocks[current_block_type_index].m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*selectedTrack*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(section, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

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
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(div0, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(navbar);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $tracks;
    	validate_store(tracks, "tracks");
    	component_subscribe($$self, tracks, $$value => $$invalidate(6, $tracks = $$value));

    	onMount(() => {
    		let json = localStorage.getItem("tracksLastUpdate");
    		let updateVer = "3";

    		if (!json || json !== updateVer) {
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

    	const click_handler_1 = () => $$invalidate(1, search = "");

    	$$self.$capture_state = () => ({
    		onMount,
    		Navbar,
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
    		input_input_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    var app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
