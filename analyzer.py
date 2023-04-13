import csv
from outlook_msg import Message

# read in .msg
with open('email.msg', 'rb') as f:
    msg = Message(f)

subject = msg.subject
body = msg.body
sender = msg.sender.name
recipients = ', '.join(r.name for r in msg.recipients)
# to .txt
#with open('email.csv', 'w', newline='', encoding='utf-8') as f:
#    writer = csv.writer(f, delimiter=',')
#    writer.writerow(['Subject', 'Body', 'Sender', 'Recipients'])
#    writer.writerow([subject, body, sender, recipients])

# csv to .txt
#with open('email.csv', 'r', newline='', encoding='utf-8') as f_csv:
#    with open('email.txt', 'w', newline='', encoding='utf-8') as f_txt:
#        reader = csv.reader(f_csv, delimiter=',')
#        for row in reader:
#            f_txt.write('\t'.join(row) + '\n')

#check for domain
domain_score = False

sender_ending = sender[sender.len()-3]
sender_ending = sender_ending + sender[sender.len()-2]
sender_ending = sender_ending + sender[sender.len()-1]

if sender_ending != "com" or sender_ending != "net":
     domain_score = True
if sender_ending[1]+sender_ending[2] != "de":
    domain_score = True
