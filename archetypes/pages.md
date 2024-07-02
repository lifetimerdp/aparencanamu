+++
title = "{{ replace .File.ContentBaseName "-" " " | title }}"
layout = "{{ .Name | replaceRE "^([0-9]+.*-)" "" | replaceRE "(.*).md$" "$1" }}"
type = "page"
+++
