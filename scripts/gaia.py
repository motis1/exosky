import sys
import json

def main():
    data = json.load(sys.stdin)

    json.dump(data, sys.stdout)

if __name__ == "__main__":
    main()
