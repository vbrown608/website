var _ = require('lodash');
var inputs = require("./data/instruction-inputs.json");
var strings = require("./data/instruction-strings.json");

module.exports = (function() {
    // JSON blobs:
    // input -- generated by the web UI
    // strings -- a table of [translatable, reusable] strings that can be edited separately from this JS

    var out = "";

    iprint = function(s, dict={}) {
        dict.cmd = command;
        out = out + _.template(s, dict)();
        return out;
    }

    var command = strings.cb_cmd;  // default, but can be changed by print_cbauto_instructions


    print_help = function() {
        out = "";
        print_install_instructions()
        print_getting_started_instructions()
        return out;
    }

    print_install_instructions = function() {
        if (input.usecase == "developer") {
            return strings.dev_install;
        }
        if (input.os == "debian" || input.os == "ubuntu") {
            return print_debian_install_instructions()
        }
        if (input.os == "python"){
            return print_pip_install_instructions()
        }
        if (input.os == "gentoo"){
            return print_gentoo_install_instructions()
        }
        if (input.os == "bsd"){
            return print_bsd_install_instructions()
        }
        if (input.os == "rhel" || input.os == "centos" || input.os == "fedora"){
            return print_rhel_install_instructions()
        }
        print_cbauto_instructions()
    }

    print_gentoo_install_instructions = function() {
        package_name = "certbot"
        if (input.webserver == "apache") {
            package_name = "certbot-apache"
            command = "certbot-apache"
        }
        return iprint("emerge " + package_name)
    }

    print_bsd_install_instructions = function() {
        return iprint("pkg install py27-letsencrypt")
    }

    print_rhel_install_instructions = function() {
        // from: https://digitz.org/blog/lets-encrypt-ssl-centos-7-setup/
        if (input.os == "centos") {
            setup = "yum install epel-release\n"
            if (input.os_version < 7) {
                setup += "rpm -ivh https://rhel6.iuscommunity.org/ius-release.rpm\n"
                setup += "yum --enablerepo=ius install git python27 python27-devel python27-pip python27-setuptools python27-virtualenv -y\n"
            }
            setup += "yum install git\n"
            return print_cbauto_instructions(setup)
        }
        else if (input.os == "rhel") {
            return print_cbauto_instructions()
        }
    }

    print_debian_install_instructions = function() {
        backport = "";
        if (input.os == "debian" && input.os_version <= 7) {
            return print_cbauto_instructions();
        }
        else if (input.os == "ubuntu" && input.os_version <= 15.10) {
            return print_cbauto_instructions();
        }
        else if (input.os == "debian" && input.os_version == 8) {
            iprint(strings.jessie_backports_instructions);
            backport = " -t jessie-backports "
        }
        return iprint("apt-get install " + backport + debian_packages())
    }

    debian_packages = function() {
        return strings["debian"][input.webserver];
    }

    print_cbauto_instructions = function(inp="") {
        iprint(inp + strings.cbauto_install);
        command = strings.cbauto_cmd;
    }

    print_getting_started_instructions = function() {
        if (input.usecase == "automated")
            print_automated_getting_started()
        else if (input.usecase == "manual")
            print_manual_getting_started()
        else if (input.usecase == "developer")
            print_developer_getting_started()
    }

    print_automated_getting_started = function() {
        if (input.webserver == "apache") {
            return iprint(strings.apache_automated);
        } else if (input.webserver == "haproxy" || input.webserver == "plesk") {
            iprint(strings.certonly_automated);
            iprint(strings.thirdparty_plugin_note, {plugin: input.webserver});
        } else {
            return iprint(strings.certonly_automated);
        }
    }

    print_manual_getting_started = function() {
        return iprint(strings.manual);
    }

    print_developer_getting_started = function() {
        if (input.webserver == "apache")
            return iprint(strings.dev_apache)
        else if (input.webserver == "nginx")
            return iprint(strings.dev)
        else
            return iprint(strings.dev)
    }

    return {
        print_help: print_help
    }
})()