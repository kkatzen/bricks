#!/usr/bin/env python
import sys
import hashlib

# input: file of lines
#ignore input shorter than 8 words
#truncate input longer than 8 words
#ignore blank lines

subs = {'a' : ('@', '4', '^'), 's' : ('$', '5'), 'o': ('0'), 't':('7'),
     'l': ('1'), 'i':('1', ']','['), 'e':('3'), 'b':('8'),
     }


def getFirsts(input):
    input = input.replace("'", "")
    input = input.replace("\"", "")
    wds = input.split()
    if(len(wds) < LEN):   return None

    output = ""
    for i in range(0, LEN):
        output += wds[i][0]
    return output

#trans: what is being substituted, to: what being subbed to
def perm(input_string):
    if not input_string:
        yield ""
    else:
        first = input_string[:1]
        if first == first.upper: #not interested in transforming
            raise Exception("This should be a lower case letter, instead: "+first)
            #for sub_casing in aPerm(input_string[1:], trans, to):
            #    yield first + sub_casing
        else: #interested in transforming
            for sub_casing in perm(input_string[1:]):
                if first in subs:
                    for replacement in subs[first]:
                        yield replacement + sub_casing

                yield first         + sub_casing
                yield first.upper() + sub_casing

space4 = "    "

def run():
        file1 = open(sys.argv[1], 'r')
        lines = file1.readlines()
        for line in lines:
            if(line.startswith(space4))
                print(line)

            # line = line.strip()
            # rr = getFirsts(line)
            # if( rr == None): continue
            # rr = rr.strip().lower()

            # s = set()
            # gen = perm(rr)
            # for a in gen:
            #     print(a)
        file1.close()




LEN =8
run()